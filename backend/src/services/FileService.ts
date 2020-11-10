import Guid from 'guid';
import { Types } from 'mongoose';
import MongoClient from 'mongodb'
import { Readable } from 'stream';
import fs from "fs";
import path from 'path';
import sharp from 'sharp'
const filepreview = require('pngenerator');
const libre = require("libreoffice-convert");

import { promisify } from "util";

import EncryptionFileService from './EncryptionFileService';

import GridFSTalker from "../helpers/GridFSTalker";
import { requireNonNull, requireIsNull } from '../helpers/DataValidation';
import HttpCodes from '../helpers/HttpCodes';
import HTTPError from '../helpers/HTTPError';
import { anyToReadable, streamToBuffer } from '../helpers/Conversions';
import CryptoHelper from '../helpers/CryptoHelper';

import { IUser, User } from "../models/User";
import { IFile, File, FileType, ShareMode } from "../models/File";
import IUserSign, { UserSign } from '../models/UserSign';

enum PreciseFileType {
    Folder = "Folder",
    Audio = "Audio",
    Video = "Video",
    Image = "Image",
    PDF = "PDF",
    Text = "Text",
    Document = "Document",
    Spreadsheet = "Spreadsheet",
    Presentation = "Presentation",
    Archive = "Archive",
    Unknown = "Unknown"
}

class FileService {
    /**
     * PERMISSIONS FILE HELPERS
     */

    /* === Basic permissions === */
    // check if user is file's owner
    public static async isFileOwner(user: IUser | string, file: IFile | string): Promise<boolean> {
        user = await this.resolveUserIfNeeded(user);
        file = await this.resolveFileIfNeeded(file);
        return user._id === file.owner_id;
    }

    public static async requireIsFileOwner(user: IUser | string, file: IFile | string): Promise<void> {
        if (!await this.isFileOwner(user, file)) {
            throw new HTTPError(HttpCodes.FORBIDDEN, "User isn't file owner");
        }
    }

    public static async fileCanBeViewed(user: IUser | string, file: IFile | string): Promise<boolean> {
        user = await this.resolveUserIfNeeded(user);
        file = await this.resolveFileIfNeeded(file);
        return file.owner_id === user._id || file.sharedWith.indexOf(user._id) !== -1;
    }

    public static async requireFileCanBeViewed(user: IUser | string, file: IFile | string): Promise<void> {
        if (!await this.fileCanBeViewed(user, file)) {
            throw new HTTPError(HttpCodes.FORBIDDEN, "Unauthorized to read this file");
        }
    }

    public static async fileCanBeModified(user: IUser | string, file: IFile | string): Promise<boolean> {
        user = await this.resolveUserIfNeeded(user);
        file = await this.resolveFileIfNeeded(file);

        // if someone sign the document, then it became unmodifiable
        if(file.signs.length != 0)
            return false;

        return file.owner_id === user._id || (file.shareMode === ShareMode.READWRITE && file.sharedWith.indexOf(user._id) !== -1);
    }

    public static async requireFileCanBeModified(user: IUser | string, file: IFile | string): Promise<void> {
        if (!await this.fileCanBeModified(user, file)) {
            throw new HTTPError(HttpCodes.FORBIDDEN, "Unauthorized to read this file");
        }
    }

    // check if user can copy a file
    public static async fileCanBeCopied(user: IUser | string, file: IFile | string): Promise<boolean> {
        return await this.fileCanBeViewed(user, file);
    }

    public static async requireFileCanBeCopied(user: IUser | string, file: IFile | string): Promise<void> {
        if (!await this.fileCanBeCopied(user, file)) {
            throw new HTTPError(HttpCodes.FORBIDDEN, "Unauthorized to copy this file");
        }
    }

    // check if an user can move a file
    public static async fileCanBeMoved(user: IUser | string, file: IFile | string): Promise<boolean> {
        return await this.isFileOwner(user, file);
    }



    /**
     * FILE CHECKERS
     */
    public static fileIsDocument(file: IFile): boolean {
        return (file.type == FileType.DOCUMENT);
    }

    public static fileIsDirectory(file: IFile): boolean {
        return (file.type == FileType.DIRECTORY);
    }

    // throwers
    public static requireFileIsDocument(file: IFile): void {
        if (FileService.fileIsDocument(file) == false)
            throw new HTTPError(HttpCodes.BAD_REQUEST, "File isn't a document");
    }

    public static requireFileIsDirectory(file: IFile): void {
        if (FileService.fileIsDirectory(file) == false)
            throw new HTTPError(HttpCodes.BAD_REQUEST, "File isn't a directory");
    }



    /**
     * ACTIONS
     */
    // create file service
    public static async createDocument(user_hash: string, file: IFile, filename: string, content_type: string, fileContentBuffer: Buffer): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // be sure that file has a parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // encrypt content
        const encryptProcessReply: Record<any, any> = EncryptionFileService.encryptFileContent(fileContentBuffer); // return { "aes_key", "content" }


        // add file aes_key to user
        const user: IUser = requireNonNull(await User.findById(file.owner_id).exec(), HttpCodes.BAD_REQUEST, "User not found");
        await EncryptionFileService.addFileKeyToUser(user, file, encryptProcessReply["aes_key"]);

        // create readable
        const readablefileContent = new Readable();
        readablefileContent.push(encryptProcessReply["content"]);
        readablefileContent.push(null);

        // push document to gridfs
        const docId: string = await GridFSTalker.create(filename, content_type, readablefileContent);
        file.document_id = docId;

        // get file size and save it in File model
        file.size = fileContentBuffer.length;



        //============= TODO: tests
        /*let rsa: NodeRSA = CryptoHelper.generateRSAKeys();
        let encrypted_rsa: string = CryptoHelper.encryptRSA(rsa, fileContentBuffer);
        let decrypted_rsa: string = CryptoHelper.decryptRSA(rsa, encrypted_rsa);
        fs.writeFileSync("filenameRSA.png", decrypted_rsa, 'binary');
        


        // aes        
        const key: string = CryptoHelper.generateAES();
        const hash = CryptoHelper.encryptAES(key, fileContentBuffer);
        const text = CryptoHelper.decryptAES(key, hash);

        fs.writeFileSync("filenameAES.png", text, 'binary');



        // normal
        fs.writeFileSync("filename.png", fileContentBuffer.toString('binary'), 'binary');
        
        // e2e
        const t: string = (await FileService.getFileContent(user_hash, user, file)).content;
        fs.writeFileSync("filenameE2E_TOTAL.png", t, 'binary');
        */
        // ====================



        return await file.save();
    }

    // create a directory service
    public static async createDirectory(file: IFile): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // check that there is no gridfs document_id set (because a directory isn't a document)
        requireIsNull(file.document_id);

        // save the directory
        return await file.save();
    }

    public static async getSharedFiles(user: IUser): Promise<IFile[]> {
        return await File.find({ "sharedWith": user._id }).exec();
    }

    public static async search(user: IUser, searchBody: Record<string, unknown>): Promise<IFile[]> {
        const { name, startLastModifiedDate, endLastModifiedDate, tagIDs } = searchBody;
        const preciseFileType = searchBody.type as PreciseFileType;

        // generate the mongodb search object
        let searchArray: Record<string, unknown> = {};
        searchArray = Object.assign(searchArray, { 'owner_id': user._id });

        if (name)
            searchArray = Object.assign(searchArray, { "name": { "$regex": name, "$options": "i" } }); //"$options": "i" remove the need to manage uppercase in the user search

        if (preciseFileType) {
            switch (preciseFileType) {
                case PreciseFileType.Folder:
                    searchArray = Object.assign(searchArray, { "mimetype": "application/x-dir" });
                    break;
                case PreciseFileType.Audio:
                    searchArray = Object.assign(searchArray, { "mimetype": { "$regex": '^audio/' } });
                    break;
                case PreciseFileType.Video:
                    searchArray = Object.assign(searchArray, { "mimetype": { "$regex": '^video/' } });
                    break;
                case PreciseFileType.Image:
                    searchArray = Object.assign(searchArray, { "mimetype": { "$regex": '^image/' } });
                    break;
                case PreciseFileType.PDF:
                    searchArray = Object.assign(searchArray, { "mimetype": "application/pdf" });
                    break;
                case PreciseFileType.Text:
                    searchArray = Object.assign(searchArray, { "mimetype": "text/plain" });
                    break;
                case PreciseFileType.Document:
                    searchArray = Object.assign(searchArray, {
                        "mimetype": {
                            "$in": [
                                "application/msword",
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                "application/vnd.oasis.opendocument.text"
                            ]
                        }
                    });
                    break;
                case PreciseFileType.Spreadsheet:
                    searchArray = Object.assign(searchArray, {
                        "mimetype": {
                            "$in": [
                                "application/vnd.ms-excel",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                "application/vnd.oasis.opendocument.spreadsheet"
                            ]
                        }
                    });
                    break;
                case PreciseFileType.Presentation:
                    searchArray = Object.assign(searchArray, {
                        "mimetype": {
                            "$in": [
                                "application/vnd.ms-powerpoint",
                                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                                "application/vnd.oasis.opendocument.presentation"
                            ]
                        }
                    });
                    break;
                case PreciseFileType.Archive:
                    searchArray = Object.assign(searchArray, {
                        "mimetype": {
                            "$in": [
                                "application/x-tar",
                                "application/vnd.rar",
                                "application/x-7z-compressed",
                                "application/x-gtar",
                                "application/zip",
                                "application/gzip",
                                "application/vnd.ms-cab-compressed",
                            ]
                        }
                    });
                    break;

            }
        }

        if (startLastModifiedDate && endLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$gt": startLastModifiedDate, "$lt": endLastModifiedDate } });
        else if (startLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$gt": startLastModifiedDate } });
        else if (endLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$lt": endLastModifiedDate } });

        if (tagIDs)
            searchArray = Object.assign(searchArray, { "tags": { $elemMatch: { "_id": { $in: tagIDs } } } });

        // run the search
        return await File.find(searchArray).exec();
    }

    // get file informations from gridfs
    public static async getFileInformations(file: IFile): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file infos and return it
        return await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));
    }

    // get file content from gridfs (to start a download for example)
    public static async getFileContent(user_hash: string, user: IUser, file: IFile): Promise<Record<any, any>> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file infos & content
        const infos: any = await FileService.getFileInformations(file);
        const content: MongoClient.GridFSBucketReadStream = GridFSTalker.getFileContent(Types.ObjectId(file.document_id));
        const out: string = await EncryptionFileService.decryptFileContent(user_hash, user, file, content);

        return { infos: infos, content: out };
    }

    // update a document content
    public static async updateContentDocument(user_hash: string, user: IUser, file: IFile, fileContentBuffer: Buffer): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file name
        const fileGridFSInfos: any = await FileService.getFileInformations(file);

        // encrypt new file content
        const file_aes_key: string = await EncryptionFileService.getFileKey(user, file, user_hash); // get current file's key to encrypt new content
        const encryptProcessReply: Record<any, any> = EncryptionFileService.encryptFileContent(fileContentBuffer, file_aes_key); // return { "aes_key", "content" }
        const readableEncryptedContent: Readable = anyToReadable(encryptProcessReply.content);

        // get gridfs for document_id and put data in it
        const newDocumentId: string = await GridFSTalker.update(Types.ObjectId(file.document_id), fileGridFSInfos.filename, fileGridFSInfos.contentType, readableEncryptedContent);
        file.document_id = newDocumentId;

        // get file size and save it in File model
        file.size = fileContentBuffer.length;

        return await file.save();
    }

    // edit a document attributes
    public static async editDocument(file: IFile): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // check that id != parent_id
        if (file._id == file.parent_file_id)
            throw new HTTPError(HttpCodes.INTERNAL_ERROR, "Directory can't be parent of himself");

        // be sure that file has a valid parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // get document in GridFS to check that the document storage still existing
        if (await GridFSTalker.exists(Types.ObjectId(file.document_id)))
            return await file.save();
        else
            throw new HTTPError(HttpCodes.NOT_FOUND, "GridFS File doesn't exist");
    }

    // edit a document attributes
    public static async editDirectory(file: IFile): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // check that id != parent_id
        if (file._id == file.parent_file_id)
            throw new HTTPError(HttpCodes.INTERNAL_ERROR, "Directory can't be parent of himself");

        // check that there is no gridfs document_id set (because a directory isn't a document)
        requireIsNull(file.document_id);

        // save new version of the directory
        return await file.save();
    }

    // delete document
    public static async deleteDocument(file: IFile): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // delete file from gridfs
        GridFSTalker.delete(Types.ObjectId(file.document_id));

        // delete all user's key for that file
        await EncryptionFileService.deleteFileKeys(file);

        // delete the from file data
        return await File.findByIdAndDelete(file._id).exec();
    }

    // delete a directory
    public static async deleteDirectory(file: IFile, forceDeleteRoot = false): Promise<any> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // if file don't have parent, we don't delete it because it's a root dir
        if (!forceDeleteRoot)
            requireNonNull(file.parent_file_id);

        // start deleting
        // find all child files
        const files: IFile[] = await File.find({ parent_file_id: file._id }).exec();
        files.forEach(fileToDelete => {
            // delete directory and document recursively
            if (fileToDelete.type == FileType.DIRECTORY)
                FileService.deleteDirectory(fileToDelete);
            else
                FileService.deleteDocument(fileToDelete);
        });

        // delete directory
        return await File.findByIdAndDelete(file._id).exec();
    }

    // copy a document
    public static async copyDocument(user_hash: string, user: IUser, file: IFile, destination_id: string, copyFileName: string | undefined = undefined): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);
        
        // new filename
        // ***** generate new filename *****
        let filename: string | undefined;
        if(filename == undefined) {
            // change to something != undefined
            filename = "";

            // split to find extension later
            const filenameSplit = file.name.split(".");
            // if there is an extension
            if (filenameSplit.length > 1) {
                // we concanate all if there is multi points
                for(let i = 0; i < filenameSplit.length - 1; i++)
                filename += filenameSplit[i];

                // generate final filename
                filename = filename + " - Copy" + filenameSplit[filenameSplit.length - 1];
            } else {
                // if there is no point, we just add the postfix
                filename = file.name + " - Copy"
            }
        }
        // ***********************

        // create new file object
        const newFile: IFile = new File();
        newFile._id               = Guid.raw();
        newFile.type              = file.type;
        newFile.mimetype          = file.mimetype;
        newFile.name              = copyFileName!;
        newFile.size              = file.size;
        newFile.parent_file_id    = destination_id;
        newFile.owner_id          = user._id;
        newFile.shareMode         = ShareMode.READONLY;
        newFile.sharedWith        = [];
        newFile.sharedWithPending = [];

        // read file content and convert
        const content: MongoClient.GridFSBucketReadStream = GridFSTalker.getFileContent(Types.ObjectId(file.document_id));
        const content_buffer: Buffer = await streamToBuffer(content); // used to rebuild document from a stream of chunk

        // decrypt content
        const aes_file_key: string = await EncryptionFileService.getFileKey(user, file, user_hash);
        const decrypt_content: string = CryptoHelper.decryptAES(aes_file_key, content_buffer);

        // encrypt with a new eas key
        const encrypted_new_file: Record<any, any> = EncryptionFileService.encryptFileContent(decrypt_content);
        const encrypted_new_file_readable: Readable = anyToReadable(encrypted_new_file["content"]);

        // save new file with gridfs
        const objectId: string = await GridFSTalker.create(newFile.name, newFile.mimetype, encrypted_new_file_readable);

        // save object
        newFile.document_id = objectId;
        const out: IFile = await newFile.save(); // save the new file

        // save key to every user that have access to source document
        const users: IUser[] = await EncryptionFileService.getUsersWithAccess(file);
        for await (let user_to_add of users) {
            await EncryptionFileService.addFileKeyToUser(user_to_add, out, encrypted_new_file["aes_key"]);
        }

        return out;
    }

    // copy a directory
    public static async copyDirectory(user_hash: string, user: IUser, file: IFile, destination_id: string, copyFileName: string | undefined = undefined): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);


        // ***** generate new filename *****
        if (copyFileName == undefined) {
            // change to something != undefined
            copyFileName = file.name + " - Copy"
        }
        // ***********************


        // generate new file informations
        const newFile: IFile = new File();
        newFile._id = Guid.raw();
        newFile.type = file.type;
        newFile.name = copyFileName;
        newFile.mimetype = "application/x-dir";
        newFile.parent_file_id = destination_id;
        newFile.owner_id = user._id;

        // start copying
        const out: IFile = await newFile.save(); // save the new directory file

        // find all child files
        const files = await File.find({ parent_file_id: file._id }).exec();
        for (let i = 0; i < files.length; i++) {
            const fileToCopy: IFile = files[i];
            // copy directory and document recursively
            if(fileToCopy.type == FileType.DIRECTORY)
                await FileService.copyDirectory(user_hash, user, fileToCopy, out._id, fileToCopy.name);
            else
                await FileService.copyDocument(user_hash, user, fileToCopy, out._id, fileToCopy.name);
        }

        return out;
    }


    // generate pdf file
    public static async generatePDF(user_hash: string, user: IUser, file: IFile): Promise<Readable> {
        FileService.requireFileIsDocument(file);

        //Keep this list synced with frontend\src\app\services\files-utils\files-utils.service.ts
        //FileType.{Text,Document,Spreadsheet,Spreadsheet}
        const VALID_MIMEYPES_FOR_PDF_GENERATION = [
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
            "application/vnd.oasis.opendocument.text",
            "application/vnd.oasis.opendocument.spreadsheet",
            "application/vnd.oasis.opendocument.presentation"
        ];

        if (!VALID_MIMEYPES_FOR_PDF_GENERATION.includes(file.mimetype)) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, "PDF generation is not available for this file");
        }

        // go take content in gridfs and build content buffer
        const content = await FileService.getFileContent(user_hash, user, file);
        const inputBuffer: Buffer = Buffer.from(content.content, 'binary');

        const convertPdfFn = promisify(libre.convert);
        const outputBuffer: Buffer = await convertPdfFn(inputBuffer, "pdf", undefined);

        const readablePDF = new Readable();
        readablePDF.push(outputBuffer);
        readablePDF.push(null);
        return readablePDF;
    }

    // ask to preview a file
    public static async generatePreview(user_hash: string, user: IUser, file: IFile): Promise<Readable> {
        FileService.requireFileIsDocument(file);

        //Keep this list synced with frontend\src\app\services\files-utils\files-utils.service.ts
        //FileType.{PDF,Text,Document,Spreadsheet,Spreadsheet}
        const VALID_OFFICE_MIMEYPES = [
            "text/plain",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
            "application/vnd.oasis.opendocument.text",
            "application/vnd.oasis.opendocument.spreadsheet",
            "application/vnd.oasis.opendocument.presentation"
        ];

        if (
            !file.mimetype.startsWith("image/") &&
            !file.mimetype.startsWith("video/") &&
            !file.mimetype.startsWith("audio/") &&
            !VALID_OFFICE_MIMEYPES.includes(file.mimetype)
        ) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, "Preview is not available for this file");
        }

        // go take content in gridfs and build content buffer
        const content = await FileService.getFileContent(user_hash, user, file);
        const buffer: Buffer = Buffer.from(content.content, 'binary');

        // calculate temp files paths
        const extension = path.extname(file.name); // calculate extension
        const tmpFilename = file._id + extension;
        const tempInputFile = path.join("tmp", "input", tmpFilename);
        const tempOutputImage = path.join("tmp", "output", file._id + ".png");
        let contentOutputFile: Buffer;

        if (file.mimetype.startsWith("image/")) {
            contentOutputFile = await sharp(buffer).resize({ width: 200 }).extract({ left: 0, top: 0, width: 200, height: 130 }).png().toBuffer();
        } else {
            // save input file in temp file
            fs.writeFileSync(tempInputFile, buffer);

            // generate image and save it in a temp directory
            const options = {
                quality: 100,
                background: '#ffffff',
                pagerange: '1'
            };

            filepreview.generateSync(tempInputFile, tempOutputImage, options);
            contentOutputFile = await sharp(tempOutputImage).resize({ width: 200 }).extract({ left: 0, top: 0, width: 200, height: 130 }).png().toBuffer();
        }

        // create readable
        const readableOutput = new Readable();
        readableOutput.push(contentOutputFile);
        readableOutput.push(null);

        // delete two temp files
        fs.unlinkSync(tempInputFile);
        fs.unlinkSync(tempOutputImage);

        return readableOutput;
    }

    public static async addSign(user: IUser, file: IFile) {
        // check if user hasn't already sign the file
        if(file.signs.map(function(e) { return e.user_email; }).indexOf(user.email) != -1) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, "You already signed that document");
        }

        // create sign object
        const u_sign: IUserSign = new UserSign();
        u_sign.user_email = user.email;

        // add UserSign to the list
        file.signs.push(u_sign);

        // update signs
        return requireNonNull(await File.updateOne({ _id: file._id }, {$set: {signs: file.signs}}).exec());
    }

    private static async resolveUserIfNeeded(user: IUser | string) {
        if (typeof user === "string") {
            return requireNonNull(await User.findById(user), 404, "User not found");
        }
        return user;
    }

    private static async resolveFileIfNeeded(file: IFile | string) {
        if (typeof file === "string") {
            file = requireNonNull(await File.findById(file), 404, "File not found");
        }
        return file;
    }


}

export default FileService;