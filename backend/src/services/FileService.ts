import { IFile, File, FileType } from "../models/File";

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
    public static canViewFile(user_id: string, file_id: string): boolean {
        return this.isFileOwner(user_id, file_id) || this.fileHasBeenSharedUser(user_id, file_id);
    }

    /* check if user can modify a file
        - if user is owner
        - if user has been put in share list
    */
    public static canModifyFile(user_id: string, file_id: string): boolean {
        // TODO: manage read / write statement on a file
        return this.canViewFile(user_id, file_id);
    }

    // check if user can copy a file
    public static fileCanBeCopied(user_id: string, file_id: string): boolean {
        // TODO: check that destination_id != file_id
        return this.canViewFile(user_id, file_id);
    }

    // check if an user can move a file
    public static fileCanBeMoved(user_id: string, file_id: string): boolean {
        // TODO: check that destination_id != file_id
        return this.isFileOwner(user_id, file_id);
    }



    /**
     * ACTIONS
     */
    // create file service
    public static createFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

    // get file service
    public static getFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

    // get file content
    public static getContentFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

    // update file content
    public static updateContentFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

    // edit file attributes
    public static editFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

    // delete file
    public static deleteFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

    // copy a file
    public static copyFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

    // ask to preview a file
    public static previewFile() {
        return new Promise((resolve, reject) => {
            // TODO
        });
    }

}

export default FileService;