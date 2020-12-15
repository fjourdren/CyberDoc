import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model } from 'mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { User, UserDocument } from 'src/schemas/user.schema';
import { FILE, File, FileDocument, FOLDER, ShareMode } from '../schemas/file.schema';
import { AesService } from 'src/crypto/aes.service';
import { Types } from 'mongoose';
import { Utils } from 'src/utils';
const streamToPromise = require("stream-to-promise");
const libre = require("libreoffice-convert");
import { v4 as uuidv4 } from 'uuid';
import { TEXT_MIMETYPES, DOCUMENT_MIMETYPES, SPREADSHEET_MIMETYPES, PRESENTATION_MIMETYPES, PDF_MIMETYPES, FileType, DIRECTORY_MIMETYPE, ARCHIVE_MIMETYPES } from 'src/file-types';
import { promisify } from 'util';
import { PreviewGenerator } from './file-preview/preview-generator.service';
import { FileSearchDto } from './dto/file-search.dto';
import { CryptoService } from 'src/crypto/crypto.service';
import { FileInResponse } from './files.controller.types';

export const COLUMNS_TO_KEEP_FOR_FILE = ["_id", "name", "mimetype", "size", "updated_at", "created_at", "tags", "preview", "signs", "shareMode"];
export const COLUMNS_TO_KEEP_FOR_FOLDER = ["_id", "name", "mimetype", "updated_at", "created_at", "tags", "preview"];

@Injectable()
export class FilesService {
    private readonly gridFSModel: MongoGridFS;

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
        @InjectConnection() readonly connection: Connection,
        private readonly cryptoService: CryptoService,
        private readonly aes: AesService,
        private readonly previewGenerator: PreviewGenerator
    ) {
        this.gridFSModel = new MongoGridFS(connection.db);
    }

    async prepareFileForOutput(file: File): Promise<FileInResponse> {
        const columnsToKeep = (file.type === FOLDER) ? COLUMNS_TO_KEEP_FOR_FOLDER : COLUMNS_TO_KEEP_FOR_FILE;
        const user = await this.userModel.findOne({ _id: file.owner_id }).exec()
        if (!user) throw new InternalServerErrorException();
        const result = columnsToKeep.reduce((r, key) => {
            r[key] = file[key];
            return r;
        }, {});

        result["ownerName"] = `${user.firstname} ${user.lastname}`
        return result as FileInResponse;
    }

    async findOne(fileID: string): Promise<File | undefined> {
        return this.fileModel.findOne({ _id: fileID }).exec();
    }

    async create(user: User, name: string, mimetype: string, folderID: string) {
        const date = new Date();
        let file = new File();
        file._id = uuidv4();
        file.name = name
        file.type = mimetype === "application/x-dir" ? FOLDER : FILE;
        file.mimetype = mimetype;
        file.preview = false;
        file.parent_file_id = folderID;
        file.owner_id = user._id;
        file.shareMode = ShareMode.READONLY;
        file.sharedWith = [];
        file.shareWithPending = [];
        file.tags = [];
        file.created_at = date;
        file.updated_at = date;
        return await this.save(file);
    }

    async search(user: User, fileSearchDto: FileSearchDto): Promise<File[]> {
        const { name, type, startLastModifiedDate, endLastModifiedDate, tagIDs } = fileSearchDto;
        let query: FilterQuery<File> = { owner_id: user._id }; //TODO support shared files in search
        if (name) query["name"] = { "$regex": name, "$options": "i" };

        if (startLastModifiedDate && endLastModifiedDate) {
            query["updated_at"] = { "$gt": startLastModifiedDate, "$lt": endLastModifiedDate };
        } else if (startLastModifiedDate) {
            query["updated_at"] = { "$gt": startLastModifiedDate };
        } else if (endLastModifiedDate) {
            query["updated_at"] = { "$lt": endLastModifiedDate };
        }

        if (tagIDs) {
            query["tags"] = { $elemMatch: { "_id": { $in: tagIDs } } }
        }

        switch (type) {
            case FileType.Folder: {
                query["mimetype"] = DIRECTORY_MIMETYPE;
                break;
            }
            case FileType.Audio: {
                query["mimetype"] = { "$regex": '^audio/' };
                break;
            }
            case FileType.Video: {
                query["mimetype"] = { "$regex": '^video/' };
                break;
            }
            case FileType.Image: {
                query["mimetype"] = { "$regex": '^image/' };
                break;
            }
            case FileType.PDF: {
                query["mimetype"] = { "$in": PDF_MIMETYPES };
                break;
            }
            case FileType.Text: {
                query["mimetype"] = { "$in": TEXT_MIMETYPES };
                break;
            }
            case FileType.Document: {
                query["mimetype"] = { "$in": DOCUMENT_MIMETYPES };
                break;
            }
            case FileType.Spreadsheet: {
                query["mimetype"] = { "$in": SPREADSHEET_MIMETYPES };
                break;
            }
            case FileType.Presentation: {
                query["mimetype"] = { "$in": PRESENTATION_MIMETYPES };
                break;
            }
            case FileType.Archive: {
                query["mimetype"] = { "$in": ARCHIVE_MIMETYPES };
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

    async getFileContent(currentUser: User, userHash: string, file: File) {
        const rawStream = this.gridFSModel.bucket.openDownloadStream(Types.ObjectId(file.document_id));
        const aesKey = this.cryptoService.getFileAESKey(currentUser, userHash, file._id);
        return Buffer.from(this.aes.decrypt(aesKey, await Utils.readableToBuffer(rawStream)), "binary");
    }

    async setFileContent(currentUser: User, userHash: string, file: File, buffer: Buffer) {
        let aesKey = this.cryptoService.getFileAESKey(currentUser, userHash, file._id);
        if (!aesKey) {
            aesKey = await this.cryptoService.createAndGetFileAESKey(currentUser, userHash, file._id);
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
        let copyFile = await this.create(user, copyFilename, file.mimetype, destFolderID);
        copyFile.tags = file.tags;
        copyFile.preview = file.preview;
        copyFile = await this.save(copyFile);
        await this.setFileContent(user, userHash, copyFile, await this.getFileContent(user, userHash, file));
        return copyFile;
    }

    async delete(file: File) {
        if (file.type == FOLDER) {
            for (const item of await this.getFolderContents(file._id)) {
                await this.delete(item);
            }
        } else {
            await this.cryptoService.deleteAllAESKeysForFile(file._id);
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
