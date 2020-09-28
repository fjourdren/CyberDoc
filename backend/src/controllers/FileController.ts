import { Request, Response } from 'express';
import { IFile, File, FileType } from "../models/File";

import HttpCodes from '../helpers/HttpCodes'
import FileService from '../services/FileService';
import { logger } from '../helpers/Log';
import GridFSTalker from '../helpers/GridFSTalker';

class FileController {
    // upload a new file controller
    public static async upload(req: Request, res: Response) {
        // if user is owner
        // if user is owner of parent place
        // file type is autorized

        filename = req.query.name;
        content_type = req.query.type;

        writeStream.on('finish', function() {
            return res.status(200).send({
                message: fileId.toString()
            });
        });

        throw new Error('Method not implemented.');
    }


    // get content and informations of a file controller
    public static get(req: Request, res: Response) {
        // if user is owner of the file (or have an access)

        

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
    public static updateContent(req: Request, res: Response) {
        // if user is owner (or have rights to modify)

        // TODO
    }


    // edit atributes of a file controller
    public static edit(req: Request, res: Response) {
        // if user is owner
        // ne pas pouvoir déplacer un fichier dans lui même

        // TODO
    }


    // delete a file controller
    public static async delete(req: Request, res: Response) {
        try {
            // if user is owner or have access
            let user_id = res.locals.user.APP_JWT_TOKEN._id;
            let file_id = req.params.fileId;
        
        
            // === find file ===
            let file: IFile = (await File.findById(file_id))!;
        

            // ===  if file not found === 
            if(file == undefined) {
                logger.error("User_id: " + user_id + " asked to access a file that doesn't exist. File_id: " + file_id);
        
                res.status(HttpCodes.NOT_FOUND);
                res.json({
                    success: false,
                    msg: "Unknow file"
                });
            }
        
    
            // ===  check if user isn't owner === 
            if(!FileService.isFileOwner(user_id, file._id)) {
                logger.error("User_id: " + user_id + " tried to access a file that he's not the owner. File_id: " + file_id);
        
                res.status(HttpCodes.NOT_FOUND);
                res.json({
                    success: false,
                    msg: "Unknow file"
                });
            }   
            

            // ===  delete file ===
            FileService.deleteFile(file).then(function() {
                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "Deleted"
                });
            }).catch(function(err) {
                logger.error(err);
            
                res.status(HttpCodes.INTERNAL_ERROR);
                res.json({
                    success: false,
                    msg: "Deletion failed"
                });
            });
        } catch(err) {
            logger.error(err);
        
            res.status(HttpCodes.INTERNAL_ERROR);
            res.json({
                success: false,
                msg: "Unknow error"
            });
        }        
    }


    // copy a file controller
    public static copy(req: Request, res: Response) {
        // if user is owner (or have right to copy)

        // TODO
    }


    // ask to generate a preview of a file controller
    public static preview(req: Request, res: Response) {
        // if user is owner or have access

        // TODO
    }


    // start downloading a file controller
    public static async download(req: Request, res: Response) {
        try {
            // if user is owner or have access
            let user_id = res.locals.user.APP_JWT_TOKEN._id;
            let file_id = req.params.fileId;
        
            // === find file ===
            let file: IFile = (await File.findById(file_id))!;
        
        
            // === if file not found ===
            if(file == undefined) {
                logger.error("User_id: " + user_id + " asked to access a file that doesn't exist. File_id: " + file_id);
        
                res.status(HttpCodes.NOT_FOUND);
                res.json({
                    success: false,
                    msg: "Unknow file"
                });
            }
        
        
            // === check if user can view the file ===
            if(!FileService.fileCanBeViewed(user_id, file._id)) {
                logger.error("User_id: " + user_id + " tried to access a file that he's not the owner. File_id: " + file_id);
        
                res.status(HttpCodes.NOT_FOUND);
                res.json({
                    success: false,
                    msg: "Unknow file"
                });
            }   
                
            // === get file and start download ===
            try {
                let readstream: any     = (await FileService.getContentFile(file)!);
                let gridfsDocument: any = (await FileService.getGridFSFile(file.document_id)!);

                // start the download
                res.set('Content-Type', gridfsDocument.contentType);
                res.set('Content-Disposition', 'attachment; filename="' + gridfsDocument.filename + '"');
        
                readstream.pipe(res);
            } catch(err) {
                logger.error("User_id: " + user_id + " access to download a file that can't be get on the gridfs cluster. File_id: " + file_id);
                
                res.status(HttpCodes.NOT_FOUND);
                res.json({
                    success: false,
                    msg: "Unknow file"
                });
            }
            
        } catch(err) {
            logger.error(err);
        
            res.status(HttpCodes.INTERNAL_ERROR);
            res.json({
                success: false,
                msg: "Unknow error"
            });
        }
    }
}

export default FileController;