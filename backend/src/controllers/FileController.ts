import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireIsNull, requireNonNull } from '../helpers/DataValidation';

import FileService from '../services/FileService';

import { IFile, File, FileType } from "../models/File";
import { IUser, User } from "../models/User";
import HTTPError from '../helpers/HTTPError';
import { Readable } from 'stream';

class FileController {
    // upload a new file controller
    public static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // prepare vars
            const user_id = res.locals.APP_JWT_TOKEN.user._id;
            const { name, mimetype, folderID } = req.body;
            let upfile = null;
            let file: Express.Multer.File;
            for (file of (req.files as Express.Multer.File[])) {
                if (file.fieldname === "upfile") {
                    upfile = file;
                }
            }

            requireNonNull(name);
            requireNonNull(mimetype);
            requireNonNull(folderID);

            // build IFile
            const fileToSave: IFile = new File();

            // if file is a Directory
            if (mimetype == "application/x-dir") {
                fileToSave.type = FileType.DIRECTORY;
                requireIsNull(upfile);
            }
            else { // otherwise file is a document
                fileToSave.type = FileType.DOCUMENT;
                requireNonNull(upfile);
            }

            fileToSave.name = name;
            fileToSave.parent_file_id = folderID;
            fileToSave.owner_id = user_id;

            // check that user is owner
            if (fileToSave.owner_id != user_id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            // check that user is owner of parent place
            await FileService.requireIsFileOwner(user_id, fileToSave.parent_file_id);

            // check if file is a directory or a document and create it
            let out: IFile;
            if (fileToSave.type == FileType.DIRECTORY)
                out = await FileService.createDirectory(fileToSave);
            else
                out = await FileService.createDocument(fileToSave, fileToSave.name, mimetype, Readable.from(upfile?.buffer as any));

            // reply to client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "File created",
                file: out
            });
        } catch (err) {
            next(err);
        }
    }


    // get content and informations of a file controller
    public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // prepare vars
            const user_id = res.locals.APP_JWT_TOKEN.user._id;
            const fileId = req.params.fileId;

            // find file
            const file: IFile = requireNonNull(await File.findById(fileId).exec());

            // check that user is owner
            if (file.owner_id != user_id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            // if file is a directory
            if (file.type == FileType.DIRECTORY) {
                // get owner
                const owner: IUser = requireNonNull(await User.findById(file.owner_id).exec());

                // === CALCULATE PATH ===
                const pathsOutput: Record<string, any> = [];

                let aboveFile: IFile = file;
                while (aboveFile.parent_file_id != undefined) {
                    aboveFile = requireNonNull(await File.findById(aboveFile.parent_file_id).exec())
                    pathsOutput.push({
                        "id": aboveFile._id,
                        "name": aboveFile.name
                    });
                }
                // ===========


                // === GET ALL FILES IN THE DIRECTORY ===
                const directoryContentOutput: Record<string, any> = [];

                const files: IFile[] = await File.find({ parent_file_id: file._id }).exec();

                for (let i = 0; i < files.length; i++) {
                    const fileInDir: IFile = files[i];

                    // get owner
                    const ownerFileInDir: IUser = requireNonNull(await User.findById(fileInDir.owner_id).exec());

                    // get gridfs informations if it's a document
                    let gridfsInformation: any = undefined;
                    if (fileInDir.type == FileType.DOCUMENT) {
                        gridfsInformation = requireNonNull(await FileService.getFileInformations(fileInDir));

                        directoryContentOutput.push({
                            "id": fileInDir._id,
                            "name": fileInDir.name,
                            "ownerName": ownerFileInDir.firstname + " " + ownerFileInDir.lastname,
                            "mimetype": gridfsInformation.contentType,
                            "size": gridfsInformation.length,
                            "updated_at": fileInDir.updated_at,
                            "created_at": fileInDir.created_at
                        });
                    } else { // if it's a directory
                        directoryContentOutput.push({
                            "id": fileInDir._id,
                            "name": fileInDir.name,
                            "ownerName": ownerFileInDir.firstname + " " + ownerFileInDir.lastname,
                            "mimetype": "application/x-dir",
                            "updated_at": fileInDir.updated_at,
                            "created_at": fileInDir.created_at
                        });
                    }
                }
                // ===========


                // reply to client
                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "File informations loaded",
                    content: {
                        "id": file._id,
                        "ownerName": owner.firstname + " " + owner.lastname,
                        "name": file.name,
                        "mimetype": "application/x-dir",
                        "path": pathsOutput,
                        "directoryContent": directoryContentOutput
                    }
                });

            } else { // otherwise it's a document
                const owner: IUser = requireNonNull(await User.findById(file.owner_id).exec());
                const gridFsFileInfos: any = requireNonNull(await FileService.getFileInformations(file));

                // reply to client
                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "File informations loaded",
                    content: {
                        "id": file._id,
                        "ownerName": owner.firstname + " " + owner.lastname,
                        "name": file.name,
                        "mimetype": gridFsFileInfos.contentType,
                        "size": gridFsFileInfos.length,
                        "updated_at": file.updated_at,
                        "created_at": file.updated_at
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    }


    // update content of a file
    public static async updateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // prepare vars
            let upfile = null;
            let expressfile: Express.Multer.File;
            for (expressfile of (req.files as Express.Multer.File[])) {
                if (expressfile.fieldname === "upfile") {
                    upfile = expressfile;
                }
            }

            const user_id = res.locals.APP_JWT_TOKEN.user._id;
            const fileId = req.params.fileId;

            requireNonNull(upfile);
            requireNonNull(fileId);

            // find file
            const file: IFile = requireNonNull(await File.findById(fileId).exec());

            // check that user is owner
            if (file.owner_id != user_id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            // check that file is a document
            if (file.type != FileType.DOCUMENT)
                throw new HTTPError(HttpCodes.BAD_REQUEST, "File need to be a document");

            // update content in gridfs
            await FileService.updateContentDocument(file, Readable.from(upfile?.buffer as any));

            // reply to client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "File updated"
            });
        } catch (err) {
            next(err);
        }
    }


    // edit atributes of a file controller
    public static async edit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // prepare vars
            const { name, directoryID } = req.body;
            const user_id = res.locals.APP_JWT_TOKEN.user._id;
            const fileId = req.params.fileId;

            // find file
            const file: IFile = requireNonNull(await File.findById(fileId).exec());

            // check that user is owner
            if (file.owner_id != user_id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            // modify vars
            if (name != undefined)
                file.name = name;
            if (directoryID != undefined)
                file.parent_file_id = directoryID;

            // save
            if (file.type == FileType.DIRECTORY)
                await FileService.editDirectory(file);
            else
                await FileService.editDocument(file);

            // reply client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "File informations modified"
            });
        } catch (err) {
            next(err);
        }
    }


    // delete a file controller
    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // prepare vars
            const user_id = res.locals.APP_JWT_TOKEN.user._id;
            const file_id = req.params.fileId;

            // find file
            const file: IFile = requireNonNull(await File.findById(file_id).exec());

            // check that user is owner
            if (file.owner_id != user_id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            //  delete file
            if (file.type == FileType.DIRECTORY)
                await FileService.deleteDirectory(file);
            else
                await FileService.deleteDocument(file);

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "File deleted"
            });
        } catch (err) {
            next(err);
        }
    }


    // copy a file controller
    public static async copy(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // prepare vars
            const { copyFileName, destID } = req.body;
            const user_id = res.locals.APP_JWT_TOKEN.user._id;
            const file_id = req.params.fileId;

            // check that destID isn't null
            requireNonNull(destID);

            // find user & file
            const user: IUser = requireNonNull(await User.findById(user_id).exec());
            const file: IFile = requireNonNull(await File.findById(file_id).exec());

            // check that user is owner
            if (file.owner_id != user_id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            // run copy
            let out: IFile;
            if (file.type == FileType.DIRECTORY)
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

        } catch (err) {
            next(err);
        }
    }


    // ask to generate a preview of a file controller
    /*public static preview(req: Request, res: Response) {
        // if user is owner or have access

        // TODO
    }*/


    // start downloading a file controller
    public static async download(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // if user is owner or have access
            const user_id = res.locals.APP_JWT_TOKEN.user._id;
            const file_id = req.params.fileId;

            // find file
            const file: IFile = requireNonNull(await File.findById(file_id).exec());

            // check if user can view the file
            FileService.requireFileCanBeViewed(user_id, file_id);

            // get file and start download
            const documentGridFs: any = await FileService.getFileContent(file);
            requireNonNull(documentGridFs.infos);
            requireNonNull(documentGridFs.stream);

            // start the download
            res.set('Content-Type', documentGridFs.infos.contentType);
            res.set('Content-Disposition', 'attachment; filename="' + documentGridFs.infos.filename + '"');

            documentGridFs.stream.pipe(res);
        } catch (err) {
            next(err);
        }
    }
}

export default FileController;