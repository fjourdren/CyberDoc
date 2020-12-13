import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { User } from 'src/schemas/user.schema';
import { FILE, File, FileDocument, FOLDER, ShareMode } from '../schemas/file.schema';
import { UsersService } from 'src/users/users.service';
import { AesService } from 'src/crypto/aes.service';
import { Types } from 'mongoose';
import { Utils } from 'src/utils';
const streamToPromise = require("stream-to-promise");
const libre = require("libreoffice-convert");
import { v4 as uuidv4 } from 'uuid';
import { TEXT_MIMETYPES, DOCUMENT_MIMETYPES, SPREADSHEET_MIMETYPES, PRESENTATION_MIMETYPES, PDF_MIMETYPES } from 'src/file-types';
import { promisify } from 'util';
import { PreviewGenerator } from './file-preview/preview-generator.service';

@Injectable()
export class FilesService {
    private readonly gridFSModel: MongoGridFS;

    constructor(
        @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly usersService: UsersService,
        private readonly aes: AesService,
        private readonly previewGenerator: PreviewGenerator
    ) {
        this.gridFSModel = new MongoGridFS(connection.db);
    }

    async findOne(fileID: string): Promise<File | undefined> {
        return this.fileModel.findOne({ _id: fileID }).exec();
    }

    async create(user: User, name: string, mimetype: string, folderID: string) {
        let file = new File();
        file._id = uuidv4();
        file.name = name
        file.type = mimetype === "application/x-dir" ? FOLDER : FILE;
        file.mimetype = mimetype;
        file.parent_file_id = folderID;
        file.owner_id = user._id;
        file.shareMode = ShareMode.READONLY;
        file.sharedWith = [];
        file.shareWithPending = [];
        file.tags = [];
        return await this.save(file);
    }

    async getFolderContents(folderID: string): Promise<File[]> {
        return this.fileModel.find({ parent_file_id: folderID }).exec();
    }

    async getFileContent(currentUser: User, userHash: string, file: File) {
        const rawStream = this.gridFSModel.bucket.openDownloadStream(Types.ObjectId(file.document_id));
        const aesKey = this.usersService.getFileAESKey(currentUser, userHash, file._id);
        return Buffer.from(this.aes.decrypt(aesKey, await Utils.readableToBuffer(rawStream)), "binary");
    }

    async setFileContent(currentUser: User, userHash: string, file: File, buffer: Buffer) {
        let aesKey = this.usersService.getFileAESKey(currentUser, userHash, file._id);
        if (!aesKey) {
            aesKey = await this.usersService.createAndGetFileAESKey(currentUser, userHash, file._id);
        }

        if (file.document_id) {
            this.gridFSModel.bucket.delete(Types.ObjectId(file.document_id));
        }

        const encryptedFileContents = this.aes.encrypt(aesKey, buffer);
        const readable = Utils.stringToReadable(encryptedFileContents);
        const uploadStream = this.gridFSModel.bucket.openUploadStream(file.name, { contentType: file.mimetype });
        readable.pipe(uploadStream);

        await Promise.all([streamToPromise(readable), streamToPromise(uploadStream)]);
        file.document_id = uploadStream.id.toString();
        file.size = buffer.length;

        return await new this.fileModel(file).save();
    }

    async save(file: File) {
        return await new this.fileModel(file).save();
    }

    async copyFile(user: User, userHash: string, file: File, copyFilename: string, destFolderID: string) {
        if (file.type !== FILE) throw new InternalServerErrorException();
        const copyFile = await this.create(user, copyFilename, file.mimetype, destFolderID);
        await this.setFileContent(user, userHash, copyFile, await this.getFileContent(user, userHash, file));
        return copyFile;
    }

    async delete(file: File) {
        if (file.type == FOLDER) {
            for (const item of await this.getFolderContents(file._id)) {
                await this.delete(item);
            }
        } else {
            await this.usersService.deleteAllAESKeysForFile(file._id);
            if (!(await this.gridFSModel.delete(file.document_id))) {
                throw new InternalServerErrorException(`gridFSModel.delete failed`);
            }
        }
        await (new this.fileModel(file).deleteOne())
    }

    async generatePDF(user: User, userHash: string, file: File): Promise<Buffer> {
        const validMimetypes = [
            ...TEXT_MIMETYPES,
            ...DOCUMENT_MIMETYPES,
            ...SPREADSHEET_MIMETYPES,
            ...PRESENTATION_MIMETYPES
        ];

        if (!validMimetypes.includes(file.mimetype)) throw new BadRequestException("PDF generation is not available for this file")
        const convertPdfFn = promisify(libre.convert);
        return await convertPdfFn(await this.getFileContent(user, userHash, file), "pdf", undefined);
    }

    async generatePngPreview(user: User, userHash: string, file: File): Promise<Buffer> {
        const validOfficeMimetypes = [
            ...TEXT_MIMETYPES,
            ...PDF_MIMETYPES,
            ...DOCUMENT_MIMETYPES,
            ...SPREADSHEET_MIMETYPES,
            ...PRESENTATION_MIMETYPES
        ];

        if (
            !file.mimetype.startsWith("image/") &&
            !file.mimetype.startsWith("video/") &&
            !validOfficeMimetypes.includes(file.mimetype)
        ) throw new BadRequestException("Preview is not available for this file")
        return await this.previewGenerator.generatePngPreview(file, await this.getFileContent(user, userHash, file));
    }

}
