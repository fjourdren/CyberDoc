import Guid from 'guid';

import GridFSTalker from "../helpers/GridFSTalker";
import { requireNonNull, requireIsNull } from '../helpers/DataValidation';

import IUser from "../models/User";
import { IFile, File, FileType } from "../models/File";

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
            throw new Error("User isn't file owner");
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
            throw new Error("This user can't read this file");
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
        if(!FileService.fileIsDocument(file))
            throw new Error("File isn't a document");
    }

    public static requireFileIsDirectory(file: IFile): void {
        if(!FileService.fileIsDirectory(file))
            throw new Error("File isn't a directory");
    }



    /**
     * ACTIONS
     */
    // create file service
    public static async createDocument(file: IFile, filename: string, content_type: string, fileContent: any): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // be sure that file has a parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // init vars needed
        const gridfs_id: string = Guid.raw();
        const optionsFileGridFS: any = {
            _id: gridfs_id,
            filename: filename,
            content_type: content_type
        }

        // build gridfs stream to write a document
        await GridFSTalker.create(optionsFileGridFS, fileContent);

        file.document_id = gridfs_id; // change IFile to set gridfs document id
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

    // get file informations from gridfs
    public static async getFileInformations(file: IFile): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file infos and return it
        return await GridFSTalker.getFileInfos({ _id: file.document_id });
    }

    // get file content from gridfs (to start a download for example)
    public static async getFileContent(file: IFile): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file content
        const infos: any = await GridFSTalker.getFileInfos({ _id: file.document_id });
        const out: any   = await GridFSTalker.getFileContent({ _id: file.document_id });

        return { infos: infos, stream: out };
    }

    // update a document content
    public static async updateContentDocument(file: IFile, fileContent: any): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get gridfs for document_id and put data in it
        return await GridFSTalker.create({ _id: file.document_id }, fileContent);
    }

    // edit a document attributes
    public static async editDocument(file: IFile): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // check that id != parent_id
        if(file._id == file.parent_file_id)
            throw new Error("Directory can't be parent of himself")

        // be sure that file has a valid parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // get document in GridFS to check that the document storage still existing
        if(await GridFSTalker.exists({ _id: file.document_id }))
            return await file.save();
        else
            throw new Error("GridFS File doesn't exist");
    }

    // edit a document attributes
    public static async editDirectory(file: IFile): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // check that id != parent_id
        if(file._id == file.parent_file_id)
            throw new Error("Directory can't be parent of himself")

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
        await GridFSTalker.delete({ _id: file._id });

        // delete the from file data
        return await File.findByIdAndDelete(file._id).exec();
    }

    // delete a directory
    public static async deleteDirectory(file: IFile): Promise<any> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // if file don't have parent, we don't delete it because it's a root dir
        requireNonNull(file.parent_file_id);

        // start deleting
        // find all child files
        const files = await File.find({ parent_file_id: file._id }).exec();
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
        const fileGridFsInformations: any = await GridFSTalker.getFileInfos({ _id: file.document_id });
        const fileReader: any             = await GridFSTalker.getFileContent({ _id: file.document_id });


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


        // generate the new gridfs informations
        const newFileGridFsInformations      = fileGridFsInformations;
        newFileGridFsInformations._id      = Guid.raw();
        newFileGridFsInformations.filename = copyFileName;

        // generate new file informations
        const newFile: IFile = file;
        newFile._id            = Guid.raw();
        newFile.name           = copyFileName;       
        newFile.parent_file_id = destination_id;
        newFile.document_id    = newFileGridFsInformations._id;
        newFile.owner_id       = user._id;

        // start copying
        await GridFSTalker.create(newFileGridFsInformations, fileReader); // generate the copy of the document in grid fs
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
        const newFile: IFile = file;
        newFile._id            = Guid.raw();
        newFile.name           = copyFileName;
        newFile.parent_file_id = destination_id;
        newFile.owner_id       = user._id;

        // start copying
        const out: IFile = await newFile.save(); // save the new directory file

        // find all child files
        const files = await File.find({ parent_file_id: file._id }).exec();
        files.forEach(fileToCopy => {
            // copy directory and document recursively
            if(fileToCopy.type == FileType.DIRECTORY)
                FileService.copyDirectory(user, fileToCopy, out._id);
            else
                FileService.copyDocument(user, fileToCopy, out._id);
        });

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