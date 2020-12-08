import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { User } from 'src/users/schemas/user.schema';
import { FILE, File, FileDocument, FOLDER } from './schemas/file.schema';
import { UsersService } from 'src/users/users.service';
import { AesService } from 'src/crypto/aes.service';
import { Types } from 'mongoose';
import { Utils } from 'src/utils';
const streamToPromise = require("stream-to-promise");
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
    private readonly gridFSModel: MongoGridFS;

    constructor(
        @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly usersService: UsersService,
        private readonly aes: AesService
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
}
