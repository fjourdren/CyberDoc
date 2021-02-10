import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, FilterQuery, Model, Types } from 'mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { User, UserDocument } from 'src/schemas/user.schema';
import {
  FILE,
  File,
  FileDocument,
  FOLDER,
  ShareMode,
} from '../schemas/file.schema';
import { AesService } from 'src/crypto/aes.service';
import { Utils } from 'src/utils';
import * as libreofficeConvert from 'libreoffice-convert';
import { v4 as uuidv4 } from 'uuid';
import {
  ARCHIVE_MIMETYPES,
  DIRECTORY_MIMETYPE,
  DOCUMENT_MIMETYPES,
  FileType,
  PDF_MIMETYPES,
  PRESENTATION_MIMETYPES,
  SPREADSHEET_MIMETYPES,
  TEXT_MIMETYPES,
} from 'src/files/file-types';
import { promisify } from 'util';
import { PreviewGenerator } from './file-preview/preview-generator.service';
import { FileSearchDto } from './dto/file-search.dto';
import { CryptoService } from 'src/crypto/crypto.service';
import { FileInResponse } from './files.controller.types';
import { EditFileMetadataDto } from './dto/edit-file-metadata.dto';
import { readFile as _readFile } from 'fs';
import { join } from 'path';
import { BillingService } from '../billing/billing.service';
import { UserDevice } from '../schemas/user-device.schema';

const readFile = promisify(_readFile);
import {
  ETHERPAD_MIMETYPE,
  EtherpadExportFormat,
  Etherpad,
} from './etherpad/etherpad';
import { ConfigService } from '@nestjs/config';
import { FileAcl } from './file-acl';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const streamToPromise = require('stream-to-promise');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cron = require('node-cron');

export const COLUMNS_TO_KEEP_FOR_FILE = [
  '_id',
  'parent_file_id',
  'name',
  'mimetype',
  'size',
  'bin_id',
  'updated_at',
  'created_at',
  'tags',
  'preview',
  'signs',
  'shareMode',
  'deviceUsedForCreation',
];
export const COLUMNS_TO_KEEP_FOR_FOLDER = [
  '_id',
  'parent_file_id',
  'name',
  'mimetype',
  'updated_at',
  'created_at',
  'tags',
  'preview',
  'deviceUsedForCreation',
  'owner_id',
  'bin_id',
];

@Injectable()
export class FilesService {
  private readonly gridFSModel: MongoGridFS;
  private readonly etherpad: Etherpad;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
    @InjectConnection() readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly aes: AesService,
    private readonly previewGenerator: PreviewGenerator,
    private readonly billingService: BillingService,
  ) {
    this.gridFSModel = new MongoGridFS(connection.db);
    this.etherpad = new Etherpad(this, configService);
    cron.schedule('0 * * * *', () => {
      this.deleteOldFilesFromBin();
    });
  }

  async prepareFileForOutput(file: File): Promise<FileInResponse> {
    const columnsToKeep =
      file.type === FOLDER
        ? COLUMNS_TO_KEEP_FOR_FOLDER
        : COLUMNS_TO_KEEP_FOR_FILE;
    const user = await this.userModel.findOne({ _id: file.owner_id }).exec();
    if (!user) throw new InternalServerErrorException();
    const result = columnsToKeep.reduce((r, key) => {
      r[key] = file[key];
      return r;
    }, {});

    result['ownerName'] = `${user.firstname} ${user.lastname}`;
    switch (FileAcl.getAvailableAccess(file, user)) {
      case FileAcl.NONE:
        result['access'] = 'none';
        break;
      case FileAcl.READ:
        result['access'] = 'read';
        break;
      case FileAcl.WRITE:
        result['access'] = 'write';
        break;
      case FileAcl.OWNER:
        result['access'] = 'owner';
        break;
      default:
        throw new InternalServerErrorException(`Invalid file acl`);
    }

    return result as FileInResponse;
  }

  async findOne(fileID: string): Promise<File | undefined> {
    return this.fileModel.findOne({ _id: fileID }).exec();
  }

  async create(
    mongoSession: ClientSession,
    user: User,
    currentDevice: UserDevice,
    name: string,
    mimetype: string,
    folderID: string,
    __allowNullFolderID = false,
  ) {
    const parentFolder = await this.findOne(folderID);
    if (parentFolder) {
      if (parentFolder.type !== FOLDER)
        throw new BadRequestException('folderID is not a folder');

      if (parentFolder.owner_id !== user._id)
        throw new ForbiddenException(
          'The user have to be the owner of parent folder',
        );
    } else if (!__allowNullFolderID) {
      throw new BadRequestException('folderID is missing');
    }

    const date = new Date();
    const file = new File();
    file._id = uuidv4();
    file.name = name;
    file.type = mimetype === 'application/x-dir' ? FOLDER : FILE;
    file.mimetype = mimetype;
    file.preview = false;
    file.parent_file_id = folderID;
    file.owner_id = user._id;
    file.shareMode = ShareMode.READONLY;
    file.sharedWith = [];
    file.shareWithPending = [];
    file.tags = [];
    file.deviceUsedForCreation = currentDevice;
    file.bin_id = false;
    file.created_at = date;
    file.updated_at = date;

    return await new this.fileModel(file).save({ session: mongoSession });
  }

  async createFromTemplate(
    mongoSession: ClientSession,
    user: User,
    currentDevice: UserDevice,
    userHash: string,
    fileName: string,
    folderID: string,
    templateID: string,
  ) {
    const templates = JSON.parse(
      (
        await readFile(join(__dirname, '../../file-templates/templates.json'))
      ).toString(),
    );
    const template = templates.find((item) => item.id === templateID);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    let file = await this.create(
      mongoSession,
      user,
      currentDevice,
      fileName,
      template.mimetype,
      folderID,
    );

    const templateFileContent = await readFile(
      join(__dirname, `../../file-templates/${template.filename}`),
    );
    file = await this.setFileContent(
      mongoSession,
      user,
      userHash,
      file,
      templateFileContent,
    );

    return file;
  }

  async search(user: User, fileSearchDto: FileSearchDto): Promise<File[]> {
    const {
      name,
      type,
      startLastModifiedDate,
      endLastModifiedDate,
      tagIDs,
    } = fileSearchDto;
    const query: FilterQuery<File> = { owner_id: user._id }; //TODO support shared files in search
    if (name) query['name'] = { $regex: name, $options: 'i' };

    if (startLastModifiedDate && endLastModifiedDate) {
      query['updated_at'] = {
        $gt: startLastModifiedDate,
        $lt: endLastModifiedDate,
      };
    } else if (startLastModifiedDate) {
      query['updated_at'] = { $gt: startLastModifiedDate };
    } else if (endLastModifiedDate) {
      query['updated_at'] = { $lt: endLastModifiedDate };
    }

    if (tagIDs) {
      query['tags'] = { $elemMatch: { _id: { $in: tagIDs } } };
    }

    switch (type) {
      case FileType.Folder: {
        query['mimetype'] = DIRECTORY_MIMETYPE;
        break;
      }
      case FileType.Audio: {
        query['mimetype'] = { $regex: '^audio/' };
        break;
      }
      case FileType.Video: {
        query['mimetype'] = { $regex: '^video/' };
        break;
      }
      case FileType.Image: {
        query['mimetype'] = { $regex: '^image/' };
        break;
      }
      case FileType.PDF: {
        query['mimetype'] = { $in: PDF_MIMETYPES };
        break;
      }
      case FileType.Text: {
        query['mimetype'] = { $in: TEXT_MIMETYPES };
        break;
      }
      case FileType.Document: {
        query['mimetype'] = { $in: DOCUMENT_MIMETYPES };
        break;
      }
      case FileType.Spreadsheet: {
        query['mimetype'] = { $in: SPREADSHEET_MIMETYPES };
        break;
      }
      case FileType.Presentation: {
        query['mimetype'] = { $in: PRESENTATION_MIMETYPES };
        break;
      }
      case FileType.Archive: {
        query['mimetype'] = { $in: ARCHIVE_MIMETYPES };
        break;
      }
    }

    return await this.fileModel.find(query).exec();
  }

  async getFolderContents(folderID: string): Promise<File[]> {
    return this.fileModel.find({ parent_file_id: folderID }).exec();
  }

  async getAllFilesForUser(userID: string): Promise<File[]> {
    return this.fileModel.find({ owner_id: userID }).exec();
  }

  async getUsedSpace(currentUser: User) {
    const files = await this.fileModel.find({
      owner_id: currentUser._id,
      type: FILE,
    });

    let usedSpace = 0;
    for (const file of files) {
      usedSpace += file.size;
    }
    return usedSpace;
  }

  async getFileContent(currentUser: User, userHash: string, file: File) {
    const rawStream = this.gridFSModel.bucket.openDownloadStream(
      Types.ObjectId(file.document_id),
    );
    const aesKey = this.cryptoService.getFileAESKey(
      currentUser,
      userHash,
      file._id,
    );
    return Buffer.from(
      this.aes.decrypt(aesKey, await Utils.readableToBuffer(rawStream)),
      'binary',
    );
  }

  async setFileContent(
    mongoSession: ClientSession,
    currentUser: User,
    userHash: string,
    file: File,
    buffer: Buffer,
  ) {
    const usedSpace = await this.getUsedSpace(currentUser);
    const availableSpace = this.billingService.getAvailableSpaceForSubscription(
      await this.billingService.getSubscription(currentUser.billingAccountID),
    );

    if (usedSpace + buffer.length > availableSpace) {
      throw new HttpException('Insufficient Storage', 507);
    }

    let aesKey = this.cryptoService.getFileAESKey(
      currentUser,
      userHash,
      file._id,
    );
    if (!aesKey) {
      aesKey = await this.cryptoService.createAndGetFileAESKey(
        currentUser,
        userHash,
        file._id,
      );
    }

    if (file.document_id) {
      this.gridFSModel.bucket.delete(Types.ObjectId(file.document_id));
    }

    const encryptedFileContents = this.aes.encrypt(aesKey, buffer);
    const readable = Utils.stringToReadable(encryptedFileContents);
    const uploadStream = this.gridFSModel.bucket.openUploadStream(file.name, {
      contentType: file.mimetype,
    });
    readable.pipe(uploadStream);

    await Promise.all([
      streamToPromise(readable),
      streamToPromise(uploadStream),
    ]);
    file.document_id = uploadStream.id.toString();
    file.size = buffer.length;

    return await new this.fileModel(file).save({ session: mongoSession });
  }

  async exportEtherpadPadAssociatedWithFile(
    user: User,
    userHash: string,
    file: File,
    exportFormat: EtherpadExportFormat,
  ) {
    try {
      await this.etherpad.createEmptyPad(file._id);
      await this.etherpad.syncPadFromCyberDoc(user, userHash, file, file._id);
    } catch (e) {
      if (e instanceof BadRequestException) {
        //le pad existe déjà
      } else {
        throw e;
      }
    }

    const data = await this.etherpad.exportPad(file._id, exportFormat);

    if ((await this.etherpad.getUsersCountOnPad(file._id)) == 0) {
      await this.etherpad.deletePad(file._id);
    }

    return data;
  }

  async setFileMetadata(
    mongoSession: ClientSession,
    user: User,
    file: File,
    editFileMetadataDto: EditFileMetadataDto,
  ) {
    const userIsFileOwner = user._id === file.owner_id;
    const requireIsFileOwner = () => {
      if (!userIsFileOwner)
        throw new ForbiddenException(
          'The user have to be the owner of the file to edit `preview`, `directoryID` and `shareMode`',
        );
    };

    if (editFileMetadataDto.name) file.name = editFileMetadataDto.name;

    if (editFileMetadataDto.directoryID) {
      requireIsFileOwner();
      file.parent_file_id = editFileMetadataDto.directoryID;
    }

    if (editFileMetadataDto.preview) {
      requireIsFileOwner();
      if (editFileMetadataDto.preview && file.type !== FILE)
        throw new BadRequestException('Preview is not available for folders');
      file.preview = editFileMetadataDto.preview;
    }

    if (editFileMetadataDto.shareMode) {
      requireIsFileOwner();
      file.shareMode = editFileMetadataDto.shareMode;
    }

    return await new this.fileModel(file).save({ session: mongoSession });
  }

  async copyFile(
    mongoSession: ClientSession,
    user: User,
    currentDevice: UserDevice,
    userHash: string,
    file: File,
    copyFilename: string,
    destFolderID: string,
  ) {
    if (file.type !== FILE) throw new InternalServerErrorException();
    let copyFile = await this.create(
      mongoSession,
      user,
      currentDevice,
      copyFilename,
      file.mimetype,
      destFolderID,
    );
    copyFile.tags = file.tags;
    copyFile.preview = file.preview;
    copyFile = await new this.fileModel(copyFile).save({
      session: mongoSession,
    });
    await this.setFileContent(
      mongoSession,
      user,
      userHash,
      copyFile,
      await this.getFileContent(user, userHash, file),
    );
    return copyFile;
  }

  async sendToBin(file: File, mongoSession: ClientSession) {
    file.bin_id = true;
    return await new this.fileModel(file).save({ session: mongoSession });
  }

  async restore(file: File, mongoSession: ClientSession) {
    file.bin_id = false;
    return await new this.fileModel(file).save({ session: mongoSession });
  }

  async getBin(user: User): Promise<File[]> {
    return await this.fileModel
      .find({ bin_id: true, owner_id: user._id })
      .exec();
  }

  async deleteOldFilesFromBin() {
    const binContents = await this.fileModel.find({ bin_id: true }).exec();
    const currentDate = new Date();

    const fileToDelete = binContents.filter((item) => {
      const fileData = new Date(item.updated_at);
      fileData.setDate(fileData.getDate() + 30);
      return fileData < currentDate;
    });

    for (const file of fileToDelete) {
      await this.delete(file);
    }
  }

  async delete(file: File) {
    if (file.type == FOLDER) {
      for (const item of await this.getFolderContents(file._id)) {
        await this.delete(item);
      }
    } else {
      if (file.mimetype === ETHERPAD_MIMETYPE) {
        await this.etherpad.deletePad(file._id);
      }

      await this.cryptoService.deleteAllAESKeysForFile(file._id);
      if (!(await this.gridFSModel.delete(file.document_id))) {
        throw new InternalServerErrorException(`gridFSModel.delete failed`);
      }
    }

    //cforgeard 17/12/20 deleteOne don't support sessions...
    await new this.fileModel(file).deleteOne();
  }

  async generatePDF(user: User, userHash: string, file: File): Promise<Buffer> {
    if (PDF_MIMETYPES.includes(file.mimetype)) {
      return await this.getFileContent(user, userHash, file);
    }

    const validMimetypes = [
      ETHERPAD_MIMETYPE,
      ...TEXT_MIMETYPES,
      ...DOCUMENT_MIMETYPES,
      ...SPREADSHEET_MIMETYPES,
      ...PRESENTATION_MIMETYPES,
    ];

    if (!validMimetypes.includes(file.mimetype))
      throw new BadRequestException(
        'PDF generation is not available for this file',
      );

    if (file.mimetype === ETHERPAD_MIMETYPE) {
      return await this.exportEtherpadPadAssociatedWithFile(
        user,
        userHash,
        file,
        EtherpadExportFormat.PDF,
      );
    } else {
      const convertPdfFn = promisify(libreofficeConvert.convert);
      return await convertPdfFn(
        await this.getFileContent(user, userHash, file),
        'pdf',
        undefined,
      );
    }
  }

  async generatePngPreview(
    user: User,
    userHash: string,
    file: File,
  ): Promise<Buffer> {
    const validOfficeMimetypes = [
      ETHERPAD_MIMETYPE,
      ...TEXT_MIMETYPES,
      ...PDF_MIMETYPES,
      ...DOCUMENT_MIMETYPES,
      ...SPREADSHEET_MIMETYPES,
      ...PRESENTATION_MIMETYPES,
    ];

    if (
      !file.mimetype.startsWith('image/') &&
      !file.mimetype.startsWith('video/') &&
      !validOfficeMimetypes.includes(file.mimetype)
    )
      throw new BadRequestException('Preview is not available for this file');

    if (file.mimetype === ETHERPAD_MIMETYPE) {
      return await this.previewGenerator.generatePngPreview(
        file,
        await this.exportEtherpadPadAssociatedWithFile(
          user,
          userHash,
          file,
          EtherpadExportFormat.PDF,
        ),
      );
    } else {
      return await this.previewGenerator.generatePngPreview(
        file,
        await this.getFileContent(user, userHash, file),
      );
    }
  }

  async syncFileWithEtherpadAndGetInfo(
    user: User,
    userHash: string,
    file: File,
  ) {
    try {
      await this.etherpad.createEmptyPad(file._id);
      await this.etherpad.syncPadFromCyberDoc(user, userHash, file, file._id);
    } catch (e) {
      if (e instanceof BadRequestException) {
        //pad already exists
      } else {
        throw e;
      }
    }

    return this.prepareFileForOutput(file);
  }

  async convertFileToEtherPadFormat(
    mongoSession: ClientSession,
    user: User,
    userHash: string,
    file: File,
  ) {
    await this.etherpad.createEmptyPad(file._id);
    await this.etherpad.importCyberDocFileToPad(user, userHash, file, file._id);

    file.name = Utils.replaceFileExtension(file.name, null);
    file.mimetype = ETHERPAD_MIMETYPE;
    file = await new this.fileModel(file).save({ session: mongoSession });

    await this.etherpad.syncPadToCyberDoc(
      mongoSession,
      user,
      userHash,
      file,
      file._id,
    );
  }

  async onAllUsersLeaveEtherpadPad(
    mongoSession: ClientSession,
    user: User,
    userHash: string,
    file: File,
  ) {
    await this.etherpad.syncPadToCyberDoc(
      mongoSession,
      user,
      userHash,
      file,
      file._id,
    );

    await this.etherpad.deletePad(file._id);
  }
}
