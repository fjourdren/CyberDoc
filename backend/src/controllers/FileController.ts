import { Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import FileService from '../services/FileService';

import { IFile, File, FileType } from "../models/File";
import { IUser, User } from "../models/User";
import GridFSTalker from '../helpers/GridFSTalker';

class FileController {
    // upload a new file controller
    public static async upload(req: Request, res: Response) {
        // prepare vars
        const user_id = res.locals.APP_JWT_TOKEN.user._id;
        const { upfile, name, mimetype, folderID } = req.body;

        // build IFile
        let fileToSave: IFile = new File();
        // if file is a Directory
        if(upfile == undefined || mimetype == undefined)
            fileToSave.type = FileType.DIRECTORY;
        else // otherwise file is a document
            fileToSave.type = FileType.DOCUMENT;

        fileToSave.name           = name;
        fileToSave.parent_file_id = folderID;
        fileToSave.owner_id       = user_id;
        
        // check that user is owner
        if(fileToSave.owner_id != user_id)
            throw new Error("User isn't owner")

        // check that user is owner of parent place
        FileService.requireIsFileOwner(user_id, fileToSave.parent_file_id);

        // check if file is a directory or a document and create it
        let out: any;
        if(fileToSave.type == FileType.DIRECTORY)
            out = await FileService.createDirectory(fileToSave);
        else
            out = await FileService.createDocument(fileToSave, fileToSave.name, mimetype, upfile);

        // reply to client
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "File created",
            file: out
        });
    }


    // get content and informations of a file controller
    public static async get(req: Request, res: Response) {
        // prepare vars
        const user_id = res.locals.APP_JWT_TOKEN.user._id;
        const fileId = req.params.fileId;

        // find file
        const file: IFile = requireNonNull(await File.findById(fileId));

        // check that user is owner
        if(file.owner_id != user_id)
            throw new Error("User isn't owner")

        

       /** OUT example
            id": "9b81d950-b605-471f-a654-4fffba6bcfc5",
            "ownerName": "John Doe",
            "name": "File.pdf",
            "mimetype": "application/pdf",
            "size": 666,
            "lastModified"
         */

         
        // TODO
    }


    // update content of a file
    public static async updateContent(req: Request, res: Response) {
        // prepare vars
        const { upfile } = req.body;
        const user_id = res.locals.APP_JWT_TOKEN.user._id;
        const fileId = req.params.fileId;
    
        // find file
        const file: IFile = requireNonNull(await File.findById(fileId));

        // check that user is owner
        if(file.owner_id != user_id)
            throw new Error("User isn't owner")

        // check that file is a document
        if(file.type != FileType.DOCUMENT)
            throw new Error("File need to be a document")

        // update content in gridfs
        await GridFSTalker.create({ _id: file.document_id }, upfile);

        // reply to client
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "File updated"
        });
    }


    // edit atributes of a file controller
    public static async edit(req: Request, res: Response) {
        // prepare vars
        const { name, directoryID } = req.body;
        const user_id = res.locals.APP_JWT_TOKEN.user._id;
        const fileId = req.params.fileId;
    
        // find file
        const file: IFile = requireNonNull(await File.findById(fileId));

        // check that user is owner
        if(file.owner_id != user_id)
            throw new Error("User isn't owner")

        // modify vars
        if(name != undefined)
            file.name = name;
        if(directoryID != undefined)
            file.parent_file_id = directoryID;

        // save
        if(file.type == FileType.DIRECTORY)
            FileService.editDirectory(file);
        else
            FileService.editDirectory(file);

        // reply client
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "File informations modified"
        });
    }


    // delete a file controller
    public static async delete(req: Request, res: Response) {
        // prepare vars
        let user_id = res.locals.user.APP_JWT_TOKEN._id;
        let file_id = req.params.fileId;
    
        // find file
        let file: IFile = requireNonNull(await File.findById(file_id));    

        // check that user is owner
        if(file.owner_id != user_id)
            throw new Error("User isn't owner")

        //  delete file
        if(file.type == FileType.DIRECTORY)
            await FileService.deleteDirectory(file);
        else
            await FileService.deleteDocument(file);

        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "File deleted"
        });
    }


    // copy a file controller
    public static async copy(req: Request, res: Response) {
        // prepare vars
        const { copyFileName, destID } = req.body;
        const user_id = res.locals.user.APP_JWT_TOKEN._id;
        const file_id = req.params.fileId;
    
        // check that copyFileName, destID aren't null
        requireNonNull(copyFileName);
        requireNonNull(destID);

        // find user & file
        const user: IUser = requireNonNull(await User.findById(user_id));
        const file: IFile = requireNonNull(await File.findById(file_id));

        // check that user is owner
        if(file.owner_id != user_id)
            throw new Error("User isn't owner")

        // run copy
        let out: IFile;
        if(file.type == FileType.DIRECTORY)
            out = await FileService.copyDirectory(user, file, destID, copyFileName);
        else
            out = await FileService.copyDocument(user, file, destID, copyFileName);
        
        // reply to user
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "File copied",
            file: out
        });
    }


    // ask to generate a preview of a file controller
    public static preview(req: Request, res: Response) {
        // if user is owner or have access

        // TODO
    }


    // start downloading a file controller
    public static async download(req: Request, res: Response) {
        // if user is owner or have access
        let user_id = res.locals.user.APP_JWT_TOKEN._id;
        let file_id = req.params.fileId;
    
        // find file
        let file: IFile = requireNonNull(await File.findById(file_id));
    
        // check if user can view the file
        FileService.requireFileCanBeViewed(user_id, file_id);
                
        // get file and start download
        let documentGridFs: any = await FileService.getFileContent(file);
        requireNonNull(documentGridFs.infos);
        requireNonNull(documentGridFs.stream);

        // start the download
        res.set('Content-Type', documentGridFs.infos.contentType);
        res.set('Content-Disposition', 'attachment; filename="' + documentGridFs.infos.filename + '"');

        documentGridFs.stream.pipe(res);
    }
}

export default FileController;