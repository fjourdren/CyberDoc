import Guid from 'guid';
import { Types } from 'mongoose';
import MongoClient from 'mongodb'
import GridFSTalker from "../helpers/GridFSTalker";
import { requireNonNull, requireIsNull } from '../helpers/DataValidation';
import HttpCodes from '../helpers/HttpCodes';
import HTTPError from '../helpers/HTTPError';
import IUser from "../models/User";
import { IFile, File, FileType } from "../models/File";
import { Readable } from 'stream';


class FileService {
    /**
     * PERMISSIONS FILE HELPERS
     */

    /* === Basic permissions === */
    // check if user is file's owner
    public static async isFileOwner(user_id: string, file_id: string): Promise<boolean> {
        const file: IFile = requireNonNull(await File.findById(file_id).exec());
        return (file.owner_id == user_id);
    }

    public static async requireIsFileOwner(user_id: string, file_id:string): Promise<void> {
        if(!await FileService.isFileOwner(user_id, file_id))
            throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't file owner");
    }



    /* === Advanced permissions === */
    /* check if user can view a file
    - if user is owner
    - TODO : if user has been put in share list
    */
    public static async fileCanBeViewed(user_id: string, file_id: string): Promise<boolean> {
        return await this.isFileOwner(user_id, file_id);
    }

    // thrower
    public static requireFileCanBeViewed(user_id: string, file_id: string): void {
        if(!FileService.fileCanBeViewed(user_id, file_id))
            throw new HTTPError(HttpCodes.UNAUTHORIZED, "Unauthorized to read this file");
    }

    /* check if user can modify a file
    - if user is owner
    - if user has been put in share list
    */
    public static async fileCanBeModified(user_id: string, file_id: string): Promise<boolean> {
        return await this.fileCanBeViewed(user_id, file_id);
    }

    // check if user can copy a file
    public static async fileCanBeCopied(user_id: string, file_id: string): Promise<boolean> {
        return await this.fileCanBeViewed(user_id, file_id);
    }

    // check if an user can move a file
    public static async fileCanBeMoved(user_id: string, file_id: string): Promise<boolean> {
        return await this.isFileOwner(user_id, file_id);
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
        if(FileService.fileIsDocument(file) == false)
            throw new HTTPError(HttpCodes.BAD_REQUEST, "File isn't a document");
    }

    public static requireFileIsDirectory(file: IFile): void {
        if(FileService.fileIsDirectory(file) == false)
            throw new HTTPError(HttpCodes.BAD_REQUEST, "File isn't a directory");
    }



    /**
     * ACTIONS
     */
    // create file service
    public static async createDocument(file: IFile, filename: string, content_type: string, fileContent: Readable): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // be sure that file has a parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // push document to gridfs
        file.document_id = GridFSTalker.create(filename, content_type, fileContent);

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

    public static async search(user: IUser, searchBody: Record<string, unknown>): Promise<IFile[]> {
        const { name, mimetypes, startLastModifiedDate, endLastModifiedDate, tagIDs } = searchBody;

        // generate the mongodb search object
        let searchArray: Record<string, unknown> = {};
        searchArray = Object.assign(searchArray, { 'owner_id': user._id });

        if(name)
            searchArray = Object.assign(searchArray, { "name": { "$regex": name, "$options": "i" } });

        if(mimetypes)
            searchArray = Object.assign(searchArray, { "mimetype": { "$in": mimetypes } });
        
        if(startLastModifiedDate && endLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$gt": startLastModifiedDate, "$lt": endLastModifiedDate } });
        else if(startLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$gt": startLastModifiedDate } });
        else if(endLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$lt": endLastModifiedDate } });

        if(tagIDs)
            searchArray = Object.assign(searchArray, { "tags": { $elemMatch: { "_id": { $in: tagIDs } }} });

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
    public static async getFileContent(file: IFile): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file infos & content
        const infos: any                              = await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));
        const out: MongoClient.GridFSBucketReadStream = GridFSTalker.getFileContent(Types.ObjectId(file.document_id));

        return { infos: infos, stream: out };
    }

    // update a document content
    public static async updateContentDocument(file: IFile, fileContent: Readable): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file name
        const fileGridFSInfos: any = await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));

        // get gridfs for document_id and put data in it
        const newDocumentId: string = GridFSTalker.update(Types.ObjectId(file.document_id), fileGridFSInfos.filename, fileGridFSInfos.contentType, fileContent);
        file.document_id = newDocumentId;
        return await file.save();
    }

    // edit a document attributes
    public static async editDocument(file: IFile): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // check that id != parent_id
        if(file._id == file.parent_file_id)
            throw new HTTPError(HttpCodes.INTERNAL_ERROR, "Directory can't be parent of himself");

        // be sure that file has a valid parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // get document in GridFS to check that the document storage still existing
        if(await GridFSTalker.exists(Types.ObjectId(file.document_id)))
            return await file.save();
        else
            throw new HTTPError(HttpCodes.NOT_FOUND, "GridFS File doesn't exist");
    }

    // edit a document attributes
    public static async editDirectory(file: IFile): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // check that id != parent_id
        if(file._id == file.parent_file_id)
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
        await GridFSTalker.delete(Types.ObjectId(file.document_id));

        // delete the from file data
        return await File.findByIdAndDelete(file._id).exec();
    }

    // delete a directory
    public static async deleteDirectory(file: IFile, forceDeleteRoot = false): Promise<any> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // if file don't have parent, we don't delete it because it's a root dir
        if(!forceDeleteRoot)
            requireNonNull(file.parent_file_id);

        // start deleting
        // find all child files
        const files: IFile[] = await File.find({ parent_file_id: file._id }).exec();
        files.forEach(fileToDelete => {
            // delete directory and document recursively
            if(fileToDelete.type == FileType.DIRECTORY)
                FileService.deleteDirectory(fileToDelete);
            else
                FileService.deleteDocument(fileToDelete);
        });

        // delete directory
        return await File.findByIdAndDelete(file._id).exec();
    }

    // copy a document
    public static async copyDocument(user: IUser, file: IFile, destination_id: string, copyFileName: string | undefined = undefined): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get document informations from gridfs
        const fileGridFsInformations: any                    = await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));
        const fileReader: MongoClient.GridFSBucketReadStream = GridFSTalker.getFileContent(Types.ObjectId(file.document_id));


        // ***** generate new filename *****
        if(copyFileName == undefined) {
            // change to something != undefined
            copyFileName = "";

            // split to find extension later
            const filenameSplit = file.name.split(".");
            // if there is an extension
            if(filenameSplit.length > 1) {
                // we concanate all if there is multi points
                for(let i = 0; i < filenameSplit.length - 1; i++)
                    copyFileName += filenameSplit[i];

                // generate final filename
                copyFileName = copyFileName + " - Copy" + filenameSplit[filenameSplit.length - 1];
            } else {
                // if there is no point, we just add the postfix
                copyFileName = file.name + " - Copy"
            }
        }
        // ***********************



        // start copying
        const objectId: string = GridFSTalker.create(copyFileName, fileGridFsInformations.contentType, fileReader); // generate the copy of the document in grid fs

        // generate new file informations
        const newFile: IFile = new File();
        newFile._id            = Guid.raw();
        newFile.type           = file.type;
        newFile.mimetype       = file.mimetype;
        newFile.name           = copyFileName;
        newFile.document_id    = objectId;   
        newFile.parent_file_id = destination_id;
        newFile.owner_id       = user._id;

        return await newFile.save(); // save the new file
    }

    // copy a directory
    public static async copyDirectory(user: IUser, file: IFile, destination_id: string, copyFileName: string | undefined = undefined): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);


        // ***** generate new filename *****
        if(copyFileName == undefined) {
            // change to something != undefined
            copyFileName = file.name + " - Copy"
        }
        // ***********************


        // generate new file informations
        const newFile: IFile = new File();
        newFile._id            = Guid.raw();
        newFile.type           = file.type;
        newFile.name           = copyFileName;
        newFile.parent_file_id = destination_id;
        newFile.owner_id       = user._id;

        // start copying
        const out: IFile = await newFile.save(); // save the new directory file

        // find all child files
        const files = await File.find({ parent_file_id: file._id }).exec();
        for(let i = 0; i < files.length; i++) {
            const fileToCopy: IFile = files[i];
            // copy directory and document recursively
            if(fileToCopy.type == FileType.DIRECTORY)
                FileService.copyDirectory(user, fileToCopy, out._id, fileToCopy.name);
            else
                FileService.copyDocument(user, fileToCopy, out._id, fileToCopy.name);
        }

        return out;
    }

    // ask to preview a file
    public static previewFile(file: IFile): void {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // TODO
    }

}

export default FileService;