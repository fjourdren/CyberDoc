import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';
import HTTPError from '../helpers/HTTPError';

import FileService from '../services/FileService';

import { IFile, File, FileType, ShareMode } from "../models/File";
import { IUser, User } from "../models/User";

class FileController {

    public static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const name = requireNonNull(req.body.name, 400, "missing name");
            const mimetype = requireNonNull(req.body.mimetype, 400, "missing mimetype");
            const destinationDir = requireNonNull(await File.findById(req.body.folderID), 404, "destination dir not found");
            FileService.requireFileIsDirectory(destinationDir);

            let fileToSave = new File();
            fileToSave.name = name;
            fileToSave.type = mimetype === "application/x-dir" ? FileType.DIRECTORY : FileType.DOCUMENT;
            fileToSave.mimetype = mimetype;
            fileToSave.preview = false;
            fileToSave.shareMode = ShareMode.READONLY;
            fileToSave.sharedWith = [];
            fileToSave.parent_file_id = destinationDir._id;
            fileToSave.owner_id = currentUser._id;
            fileToSave.tags = [];

            if (FileService.fileIsDirectory(fileToSave)) {
                fileToSave = await FileService.createDirectory(fileToSave);
            } else {
                const fileContents = FileController._requireFile(req, "upfile");
                fileToSave = await FileService.createDocument(fileToSave, fileToSave.name, mimetype, fileContents.buffer);
            }

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "File created",
                file: fileToSave
            });
        } catch (err) {
            next(err);
        }
    }

    public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const userCache = new Map<string, IUser>();
            const bodySearch: Record<string, unknown> = req.body;
            let results: IFile[] = await FileService.search(currentUser, bodySearch);

            let files: IFile[] = await FileService.search(res.locals.APP_JWT_TOKEN.user, bodySearch);
            files = files.filter(item => item._id !== currentUser.directory_id);

            let results = [];
            for (const file of files) {
                let ownerName = "Unknown";
                if (file.owner_id === currentUser._id) {
                    ownerName = `${currentUser.firstname} ${currentUser.lastname}`;
                } else {
                    if (!userCache.has(file.owner_id)) {
                        userCache.set(file.owner_id, requireNonNull(await User.findById(file.owner_id).exec()));
                    }
                    const user = userCache.get(file.owner_id);
                    ownerName = `${user?.firstname} ${user?.lastname}`;
                }

                if (file.type == FileType.DOCUMENT) {
                    results.push({
                        "_id": file._id,
                        "name": file.name,
                        "ownerName": ownerName,
                        "mimetype": file.mimetype,
                        "size": file.size,
                        "updated_at": file.updated_at,
                        "created_at": file.created_at,
                        "tags": file.tags,
                        "preview": file.preview
                    });
                } else { // if it's a directory
                    results.push({
                        "_id": file._id,
                        "name": file.name,
                        "ownerName": ownerName,
                        "mimetype": "application/x-dir",
                        "updated_at": file.updated_at,
                        "created_at": file.created_at,
                        "tags": file.tags,
                        "preview": false
                    });
                }
            }

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Done",
                results: results
            });
        } catch (err) {
            next(err);
        }
    }

    public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireFileCanBeViewed(currentUser, file);
            const fileOwner = requireNonNull(await User.findById(file.owner_id).exec());

            if (file.type == FileType.DIRECTORY) {
                // === CALCULATE PATH ===
                const pathsOutput: Record<string, any>[] = [];

                let aboveFile: IFile = file;
                while (aboveFile.parent_file_id != undefined) {
                    aboveFile = requireNonNull(await File.findById(aboveFile.parent_file_id).exec())
                    pathsOutput.push({
                        "id": aboveFile._id,
                        "name": aboveFile.name
                    });
                }

                pathsOutput.reverse();
                // ===========


                // === GET ALL FILES IN THE DIRECTORY ===
                const directoryContentOutput: Record<string, any> = [];

                const files: IFile[] = await File.find({ parent_file_id: file._id }).exec();

                for (let i = 0; i < files.length; i++) {
                    const fileInDir: IFile = files[i];

                    // get owner
                    const ownerFileInDir: IUser = requireNonNull(await User.findById(fileInDir.owner_id).exec());

                    // build reply content
                    if (fileInDir.type == FileType.DOCUMENT) {
                        directoryContentOutput.push({
                            "_id": fileInDir._id,
                            "name": fileInDir.name,
                            "ownerName": ownerFileInDir.firstname + " " + ownerFileInDir.lastname,
                            "mimetype": fileInDir.mimetype,
                            "size": fileInDir.size,
                            "updated_at": fileInDir.updated_at,
                            "created_at": fileInDir.created_at,
                            "tags": fileInDir.tags,
                            "shareMode": fileInDir.shareMode
                            "preview": fileInDir.preview
                        });
                    } else { // if it's a directory
                        directoryContentOutput.push({
                            "_id": fileInDir._id,
                            "name": fileInDir.name,
                            "ownerName": ownerFileInDir.firstname + " " + ownerFileInDir.lastname,
                            "mimetype": "application/x-dir",
                            "updated_at": fileInDir.updated_at,
                            "created_at": fileInDir.created_at,
                            "tags": fileInDir.tags,
                            "preview": false
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
                        "ownerName": fileOwner.firstname + " " + fileOwner.lastname,
                        "name": file.name,
                        "mimetype": "application/x-dir",
                        "path": pathsOutput,
                        "directoryContent": directoryContentOutput,
                        "tags": file.tags,
                        "preview": false
                    }
                });

            } else { // otherwise it's a document

                // reply to client
                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "File informations loaded",
                    content: {
                        "id": file._id,
                        "ownerName": fileOwner.firstname + " " + fileOwner.lastname,
                        "name": file.name,
                        "mimetype": file.mimetype,
                        "size": file.size,
                        "updated_at": file.updated_at,
                        "created_at": file.updated_at,
                        "tags": file.tags,
                        "shareMode": file.shareMode
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
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            const fileContents = FileController._requireFile(req, "upfile");

            await FileService.requireFileCanBeModified(currentUser, file);
            FileService.requireFileIsDocument(file);

            await FileService.updateContentDocument(file, fileContents.buffer);

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
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireIsFileOwner(currentUser, file);

            if (req.body.name != undefined)
                file.name = req.body.name;
            if (req.body.directoryID != undefined)
                file.parent_file_id = req.body.directoryID;

            if (req.body.preview != undefined) {
                if (file.type == FileType.DIRECTORY) {
                    if (req.body.preview)
                        throw new HTTPError(HttpCodes.BAD_REQUEST, "You can't turn on preview on a directory.");
                }
                file.preview = req.body.preview;
            }

            if (req.body.shareMode != undefined) {
                if (req.body.shareMode === ShareMode.READONLY || req.body.shareMode === ShareMode.READWRITE) {
                    file.shareMode = req.body.shareMode;
                } else {
                    throw new HTTPError(HttpCodes.BAD_REQUEST, "Invalid shareMode");
                }
            }
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
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireIsFileOwner(currentUser, file);

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
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            const copyFileName = req.body.copyFileName; //undefined value is OK
            const destination = requireNonNull(await File.findById(req.body.destID).exec(), 404, "Destination directory not found");

            FileService.requireFileIsDocument(file);
            FileService.requireFileIsDirectory(destination);
            await FileService.requireFileCanBeCopied(currentUser, file);
            const out = await FileService.copyDocument(currentUser, file, req.body.destID, copyFileName);

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
    public static async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireFileCanBeViewed(currentUser, file);

            if (!file.preview){
                throw new HTTPError(HttpCodes.BAD_REQUEST, "Preview not allowed for this file");
            }

            const previewImg = await FileService.generatePreview(file);

            res.set('Content-Type', 'image/png');
            res.status(HttpCodes.OK);
            previewImg.pipe(res);
        } catch (err) {
            next(err);
        }
    }

    // generate file pdf
    public static async exportPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireFileCanBeViewed(currentUser, file);

            const pdfStream = await FileService.generatePDF(file);

            res.set('Content-Type', 'application/pdf');
            res.set('Content-Disposition', 'attachment; filename="' + file.name + '.pdf"');
            res.status(HttpCodes.OK);
            pdfStream.pipe(res);
        } catch (err) {
            next(err);
        }
    }

    // start downloading a file controller
    public static async download(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireFileCanBeViewed(currentUser, file);

            const documentGridFs = await FileService.getFileContent(file);

            // start the download
            res.set('Content-Type', (documentGridFs.infos as any).contentType);
            res.set('Content-Disposition', 'attachment; filename="' + file.name + '"');
            res.status(HttpCodes.OK);
            documentGridFs.stream.pipe(res);
        } catch (err) {
            next(err);
        }
    }

    public static async getSharedFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const sharedFiles = await FileService.getSharedFiles(currentUser);

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success",
                sharedFiles: sharedFiles
            });
        } catch (err) {
            next(err);
        }
    }

    public static async getSharedAccesses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), HttpCodes.NOT_FOUND, "File not found");
            FileService.requireFileIsDocument(file);
            await FileService.requireFileCanBeViewed(currentUser, file);

            const users: Array<{email: string, name: string}> = [];
            for (const userID of file.sharedWith) {
                const user = requireNonNull(await User.findById(userID));
                users.push({
                    email: user.email,
                    name: `${user.firstname} ${user.lastname}`
                });
            }

            if (users.findIndex(item => item.email === currentUser.email) === -1){
                throw new HTTPError(HttpCodes.NOT_FOUND, "File not found");
            }

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success",
                shared_users: users
            });
        } catch (err) {
            next(err);
        }
    }

    public static async addSharingAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), HttpCodes.NOT_FOUND, "File not found");
            const user = requireNonNull(await User.findOne({"email": req.body.email}).exec(), HttpCodes.NOT_FOUND, "User not found");
            FileService.requireFileIsDocument(file);
            await FileService.requireIsFileOwner(currentUser, file);

            if (user._id === currentUser._id){
                throw new HTTPError(HttpCodes.BAD_REQUEST, "You are the owner of the file, you can't share it with yourself");
            }

            if (file.sharedWith.indexOf(user._id) === -1){
                file.sharedWith.push(user._id);
                await file.save();    
            }

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success"
            });
        } catch (err) {
            next(err);
        }
    }

    public static async removeSharingAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);

            const file = requireNonNull(await File.findById(req.params.fileId).exec(), HttpCodes.NOT_FOUND, "File not found");
            const user = requireNonNull(await User.findOne({"email": req.params.email}).exec(), HttpCodes.NOT_FOUND, "User not found");
            FileService.requireFileIsDocument(file);
            await FileService.requireIsFileOwner(currentUser, file);

            const index = file.sharedWith.indexOf(user._id);
            if (index !== -1) {
                file.sharedWith.splice(index, 1);
                await file.save();
            } else {
                throw new HTTPError(HttpCodes.BAD_REQUEST, "Specified email doesn't have sharing access to the file");
            }

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success"
            });
        } catch (err) {
            next(err);
        }
    }

    private static _requireAuthenticatedUser(res: Response): IUser {
        return requireNonNull(res.locals.APP_JWT_TOKEN.user, HttpCodes.UNAUTHORIZED, "Auth is missing or invalid");
    }

    private static _requireFile(req: Request, fieldName: string): Express.Multer.File {
        let file: Express.Multer.File | null = null;
        if (req.files) {
            for (file of (req.files as Express.Multer.File[])) {
                if (file.fieldname === fieldName) {
                    break;
                }
            }
        }

        return requireNonNull(file, HttpCodes.BAD_REQUEST, `File missing (${fieldName})`)
    }

}

export default FileController;