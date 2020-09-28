import Guid from 'guid';

import GridFSTalker from "../helpers/GridFSTalker";

import { IFile, File, FileType } from "../models/File";
import IUser from "../models/User";

class FileService {

    /**
     * PERMISSIONS FILE HELPERS
     */

    /* === Basic permissions === */
    // check if user is file's owner
    public static isFileOwner(user_id: string, file_id: string): boolean {
        let out: boolean = false;

        File.findById(file_id, function(err: Error, file: IFile) {
            if(err || file == undefined)
                throw err;
            
            if(file == undefined)
                throw Error("Unknow file");
            
            out = file.owner_id == user_id;
        });
        
        return out;
    }

    // check if user has been put in share list of the file
    public static fileHasBeenSharedUser(user_id: string, file_id: string): boolean {
        // TODO
        
        return false;
    }


    /* === Advanced permissions === */
    /* check if user can view a file
        - if user is owner
        - if user has been put in share list
    */
    public static fileCanBeViewed(user_id: string, file_id: string): boolean {
        return this.isFileOwner(user_id, file_id) || this.fileHasBeenSharedUser(user_id, file_id);
    }

    /* check if user can modify a file
        - if user is owner
        - if user has been put in share list
    */
    public static fileCanBeModified(user_id: string, file_id: string): boolean {
        return this.fileCanBeViewed(user_id, file_id);
    }

    // check if user can copy a file
    public static fileCanBeCopied(user_id: string, file_id: string): boolean {
        return this.fileCanBeViewed(user_id, file_id);
    }

    // check if an user can move a file
    public static fileCanBeMoved(user_id: string, file_id: string): boolean {
        return this.isFileOwner(user_id, file_id);
    }



    /**
     * ACTIONS
     */
    // create file service
    public static async createDocument(file: IFile, filename: string, content_type: string, fileContent: any) {
        return new Promise(async function(resolve, reject) {
            // be sure that file is a document
            if(file.type != FileType.DOCUMENT)
                reject("The file isn't a document");


            // be sure that file has a valid parent_id
            if(file.parent_file_id == undefined)
                reject("The document can't have an undefined parent");

    
            // check that parentFile is a valid Directory
            try {
                let parentFile: IFile = (await File.findById(file.parent_file_id))!;
                if(parentFile.type != FileType.DIRECTORY)
                    reject("The parentFile need to be a directory");
            } catch(err) {
                reject(err);
            }


            // init vars needed
            let gridfs_id: string = Guid.raw();
            let optionsFileGridFS: any = {
                _id: gridfs_id,
                filename: filename,
                content_type: content_type
            }

            // build gridfs stream to write a document
            let writingStream: any = await GridFSTalker.create(optionsFileGridFS, fileContent);

            writingStream.on('finish', async function() {
                file.document_id = gridfs_id; // change IFile to set gridfs document id

                // check that there is a gridfs document_id set
                if(file.document_id == undefined)
                    reject("[Document creation] A document needs to have a gridfs document_id to be saved");

                // save the file in our mongodb database
                try {
                    let out: IFile = (await file.save())!;
                    resolve(out);
                } catch(err) {
                    reject(err);
                }
            });
        });
    }

    // create a directory service
    public static async createDirectory(file: IFile, filename: string, content_type: string, fileContent: any) {
        return new Promise(async function(resolve, reject) {
            // be sure that file is a directory
            if(file.type != FileType.DIRECTORY)
                reject("The file isn't a directory");
            
    
            // check that there is no gridfs document_id set (because a directory isn't a document)
            if(file.document_id != undefined)
                reject("A directory can't have a gridfs document_id");


            // save the directory
            try {
                await file.save();
                resolve();
            } catch(err) {
                reject(err);
            }
        });
    }

    // get file content from gridfs (to start a download for example)
    public static getContentFile(file: IFile): any {
        return new Promise(async (resolve, reject) => {
            // be sure that file is a document
            if(file.type != FileType.DOCUMENT)
                reject("The file isn't a document");

            
            // get file content
            try {
                let infos: any = await GridFSTalker.getFileInfos({ _id: file.document_id });
                let out: any   = await GridFSTalker.getFileContent({ _id: file.document_id });
                resolve({ infos: infos, stream: out });
            } catch(err) {
                reject(err);
            }
        });
    }

    // update a document content
    public static updateContentDocument(file: IFile, fileContent: any) {
        return new Promise((resolve, reject) => {
            // be sure that file is a document
            if(file.type != FileType.DOCUMENT)
                reject("The file isn't a document");


            // get gridfs for document_id and put data in it
            GridFSTalker.create({ _id: file.document_id }, fileContent).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            })
        });
    }

    // edit a document attributes
    public static editDocument(file: IFile) {
        return new Promise(async (resolve, reject) => {
            // be sure that file is a document
            if(file.type != FileType.DOCUMENT)
                reject("The file isn't a document");

            
            // be sure that file has a valid parent_id
            if(file.parent_file_id == undefined)
                reject("The document can't have an undefined parent");

    
            // check that parentFile is a valid Directory
            try {
                let parentFile: IFile = (await File.findById(file.parent_file_id))!;
                if(parentFile.type != FileType.DIRECTORY)
                    reject("The parentFile need to be a directory");
            } catch(err) {
                reject(err);
            }
        

            // get document in GridFS to check that the document storage still existing
            let gridfsDocumentExists: boolean = (await GridFSTalker.exists({ _id: file.document_id })!);
            if(gridfsDocumentExists) {
                try {
                    // save new version of the file
                    file.save().then(() => {
                        resolve();
                    });
                } catch(err) {
                    reject(err);
                }
            } else {
                reject("GridFS File doesn't exist");
            }
        });
    }

    // edit a document attributes
    public static editDirectory(file: IFile) {
        return new Promise((resolve, reject) => {
            // be sure that file is a Directory
            if(file.type != FileType.DIRECTORY)
                reject("The file isn't a directory");


            // check that there is no gridfs document_id set (because a directory isn't a document)
            if(file.document_id != undefined)
                reject("A directory can't have a gridfs document_id");
    

            // save new version of the directory
            try {
                file.save().then(() => {
                    resolve();
                });
            } catch(err) {
                reject(err);
            }
        });
    }

    // delete document
    public static deleteDocument(file: IFile) {
        return new Promise((resolve, reject) => {
            // be sure that file is a document
            if(file.type != FileType.DOCUMENT)
                reject("The file isn't a document");


            // start delete
            try {
                // delete file from gridfs
                GridFSTalker.delete({ _id: file._id }).then(() => {
                    // delete the from file listing
                    File.findByIdAndRemove(file._id).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            } catch(err) {
                reject(err);
            }
        });
    }

    // delete a directory
    public static deleteDirectory(file: IFile) {
        return new Promise(async(resolve, reject) => {
            // be sure that file is a Directory
            if(file.type != FileType.DIRECTORY)
                reject("The file isn't a directory");

    
            // if file don't have parent, we don't delete it because it's a root dir
            if(file.parent_file_id == undefined)
                reject(new Error("Can't be deleted because it's a root directory"));


            // start deleting
            try {
                // find all child files
                let files = await File.find({ parent_file_id: file._id });
                files.forEach(fileToDelete => {
                    // delete directory and document recursively
                    if(fileToDelete.type == FileType.DIRECTORY)
                        FileService.deleteDirectory(fileToDelete);
                    else
                        FileService.deleteDocument(fileToDelete);
                });

                // delete directory
                let out: IFile | null = await File.findByIdAndDelete(file._id);

                resolve(out);
            } catch(err) {
                reject(err);
            }
        });
    }

    // copy a document
    public static copyDocument(user: IUser, file: IFile, destination_id: string) {
        return new Promise(async(resolve, reject) => {
            // be sure that file is a document
            if(file.type != FileType.DOCUMENT)
                reject("The file isn't a document");


            // get document informations from gridfs
            let fileGridFsInformations: any = await GridFSTalker.getFileInfos({ _id: file.document_id });
            let fileReader: any             = await GridFSTalker.getFileContent({ _id: file.document_id });
            
            let finalFilename: string = "";


            // generate new filename
            let filenameSplit = file.name.split("."); // split to find extension later
            // if there is an extension
            if(filenameSplit.length > 1) {
                // we concanate all if there is multi points
                for(let i = 0; i < filenameSplit.length - 1; i++) {
                    finalFilename += filenameSplit[i];
                }

                // generate final filename
                finalFilename = finalFilename + " - Copy" + filenameSplit[filenameSplit.length - 1];
            } else {
                // if there is no point, we just add the postfix
                finalFilename = file.name + " - Copy"
            }


            // generate the new gridfs informations
            let newFileGridFsInformations      = fileGridFsInformations;
            newFileGridFsInformations._id      = Guid.raw();
            newFileGridFsInformations.filename = finalFilename;


            // generate new file informations
            let newFile: IFile = file;
            newFile._id            = Guid.raw();
            newFile.name           = finalFilename;       
            newFile.parent_file_id = destination_id;
            newFile.document_id    = newFileGridFsInformations._id;
            newFile.owner_id       = user._id;


            // start copying
            try {
                await GridFSTalker.create(newFileGridFsInformations, fileReader); // generate the copy of the document in grid fs
                await newFile.save(); // save the new file
                resolve(newFile);
            } catch(err) {
                reject(err);
            }
        });
    }

    // copy a directory
    public static copyDirectory(user: IUser, file: IFile, destination_id: string) {
        return new Promise(async (resolve, reject) => {
            // be sure that file is a Directory
            if(file.type != FileType.DIRECTORY)
                reject("The file isn't a directory");


            // check that directory don't have GridFs document
            if(file.document_id != undefined)
                reject("A directory can't have a GridFs document");


            // generate new file informations
            let newFile: IFile = file;
            newFile._id            = Guid.raw();
            newFile.name           = file.name + " - Copy";
            newFile.parent_file_id = destination_id;
            newFile.owner_id       = user._id;


            // start copying
            try {
                let out: IFile = await newFile.save(); // save the new directory file

                // find all child files
                let files = await File.find({ parent_file_id: file._id });
                files.forEach(fileToCopy => {
                    // copy directory and document recursively
                    if(fileToCopy.type == FileType.DIRECTORY)
                        FileService.copyDirectory(user, fileToCopy, out._id);
                    else
                        FileService.copyDocument(user, fileToCopy, out._id);
                });
                resolve(out);
            } catch(err) {
                reject(err);
            }
        });
    }

    // ask to preview a file
    public static previewFile(file: IFile) {
        return new Promise((resolve, reject) => {
            // be sure that file is a document
            if(file.type != FileType.DOCUMENT)
                reject("The file isn't a document");
    
            // TODO
        });
    }

}

export default FileService;