import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';
import HTTPError from '../helpers/HTTPError';

import FileService from '../services/FileService';

import { File, FileType, IFile, ShareMode } from "../models/File";
import { IUser, User } from "../models/User";
import Mailer from "../helpers/Mailer";
import jwt from "jsonwebtoken";
import EncryptionFileService from '../services/EncryptionFileService';
import { anyToReadable, streamToBuffer } from '../helpers/Conversions';
import { Readable } from 'stream';
import { requireAuthenticatedUser, requireFile, requireUserHash } from '../helpers/Utils';
import ISharedWithPending, { SharedWithPending } from '../models/SharedWithPending';

class FileController {

    public static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = requireAuthenticatedUser(res);
            const name = requireNonNull(req.body.name, HttpCodes.BAD_REQUEST, "Missing name");
            const mimetype = requireNonNull(req.body.mimetype, HttpCodes.BAD_REQUEST, "Missing mimetype");
            const destinationDir = requireNonNull(await File.findById(req.body.folderID), HttpCodes.NOT_FOUND, "Destination dir not found");
            const user_hash = requireUserHash(req);
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
                const fileContents = requireFile(req, "upfile");
                fileToSave = await FileService.createDocument(user_hash, fileToSave, fileToSave.name, mimetype, fileContents.buffer);
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
            const currentUser = requireAuthenticatedUser(res);
            const userCache = new Map<string, IUser>();
            const bodySearch: Record<string, unknown> = req.body;
            let files: any[] = await FileService.search(res.locals.APP_JWT_TOKEN.user, bodySearch);
            files = files.filter(item => item._id !== currentUser.directory_id);

            const results = [];

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
            const currentUser = requireAuthenticatedUser(res);
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
                            "signs": fileInDir.signs,
                            "shareMode": fileInDir.shareMode,
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
                        "_id": file._id,
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
                        "_id": file._id,
                        "ownerName": fileOwner.firstname + " " + fileOwner.lastname,
                        "name": file.name,
                        "mimetype": file.mimetype,
                        "size": file.size,
                        "updated_at": file.updated_at,
                        "created_at": file.updated_at,
                        "signs": file.signs,
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
            const currentUser = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            const fileContents = requireFile(req, "upfile");
            const user_hash = requireUserHash(req);

            await FileService.requireFileCanBeModified(currentUser, file);
            FileService.requireFileIsDocument(file);

            await FileService.updateContentDocument(user_hash, currentUser, file, fileContents.buffer);

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
            const currentUser = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");

            // You can edit name of a readwrite file
            if (req.body.name != undefined) {
                await FileService.requireFileCanBeModified(currentUser, file);
                file.name = req.body.name;
            }

            if (req.body.directoryID != undefined) {
                await FileService.requireIsFileOwner(currentUser, file);
                file.parent_file_id = req.body.directoryID;
            }

            if (req.body.preview != undefined) {
                await FileService.requireIsFileOwner(currentUser, file);
                if (file.type == FileType.DIRECTORY) {
                    if (req.body.preview)
                        throw new HTTPError(HttpCodes.BAD_REQUEST, "You can't turn on preview on a directory.");
                }
                file.preview = req.body.preview;
            }

            if (req.body.shareMode != undefined) {
                await FileService.requireIsFileOwner(currentUser, file);
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
            const currentUser = requireAuthenticatedUser(res);
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
            const currentUser = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            const copyFileName = req.body.copyFileName; //undefined value is OK
            const destination = requireNonNull(await File.findById(req.body.destID).exec(), 404, "Destination directory not found");
            const user_hash = requireUserHash(req);


            FileService.requireFileIsDocument(file);
            FileService.requireFileIsDirectory(destination);
            await FileService.requireFileCanBeCopied(currentUser, file);
            const out = await FileService.copyDocument(user_hash, currentUser, file, req.body.destID, copyFileName);

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
            const user = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireFileCanBeViewed(user, file);
            const user_hash = requireUserHash(req);

            if (!file.preview) {
                throw new HTTPError(HttpCodes.BAD_REQUEST, "Preview not allowed for this file");
            }

            const previewImg = await FileService.generatePreview(user_hash, user, file);

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
            const user = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireFileCanBeViewed(user, file);
            const user_hash = requireUserHash(req);

            const pdfStream = await FileService.generatePDF(user_hash, user, file);
            let pdfFileName = file.name;
            if (pdfFileName.indexOf(".") !== -1) {
                pdfFileName.substring(0, pdfFileName.lastIndexOf("."));
            }

            res.set('Content-Type', 'application/pdf');
            res.set('Content-Disposition', `attachment; filename="${pdfFileName}"`);
            res.status(HttpCodes.OK);
            pdfStream.pipe(res);
        } catch (err) {
            next(err);
        }
    }

    // start downloading a file controller
    public static async download(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), 404, "File not found");
            await FileService.requireFileCanBeViewed(user, file);
            const user_hash = requireUserHash(req);

            const documentGridFs = await FileService.getFileContent(user_hash, user, file);
            const documentGridFsReadable: Readable = anyToReadable(documentGridFs.content);

            // start the download
            res.set('Content-Type', (documentGridFs.infos as any).contentType);
            res.set('Content-Disposition', 'attachment; filename="' + file.name + '"');
            res.status(HttpCodes.OK);

            //documentGridFsReadable.pipe(res);
            res/*.attachment('foo.png').type('png')*/.send(Buffer.from(documentGridFs.content, "binary"));
        } catch (err) {
            next(err);
        }
    }

    public static async getSharedFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = requireAuthenticatedUser(res);
            const userCache = new Map<string, IUser>();
            const sharedFiles = await FileService.getSharedFiles(currentUser);

            const results = [];
            for (const file of sharedFiles) {
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
                        "preview": file.preview,
                        "shareMode": file.shareMode
                    });
                }
            }

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success",
                results
            });
        } catch (err) {
            next(err);
        }
    }

    public static async getSharedAccesses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), HttpCodes.NOT_FOUND, "File not found");
            FileService.requireFileIsDocument(file);
            await FileService.requireFileCanBeViewed(currentUser, file);

            const users: Array<{ email: string, name: string }> = [];
            for (const userID of file.sharedWith) {
                const user = requireNonNull(await User.findById(userID));
                users.push({
                    email: user.email,
                    name: `${user.firstname} ${user.lastname}`
                });
            }

            if (currentUser._id !== file.owner_id) {
                if (users.findIndex(item => item.email === currentUser.email) === -1) {
                    throw new HTTPError(HttpCodes.NOT_FOUND, "File not found");
                }
            }


            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success",
                shared_users: users,
                shared_users_pending: file.sharedWithPending.map(function(e) { return e.email; })
            });
        } catch (err) {
            next(err);
        }
    }

    public static async addSharingAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        let status: string;
        try {
            const currentUser = requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), HttpCodes.NOT_FOUND, "File not found");
            FileService.requireFileIsDocument(file);
            await FileService.requireIsFileOwner(currentUser, file);
            const otherUserEmail = req.body.email;
            const user = await User.findOne({ "email": otherUserEmail }).exec();

            // get file's useful informations
            const user_hash = requireUserHash(req);
            const file_aes_key: string = await EncryptionFileService.getFileKey(currentUser, file, user_hash);

            if (user != undefined) {
                // check that user who share the file is different with user that will be shared
                if (user._id === currentUser._id) {
                    throw new HTTPError(HttpCodes.BAD_REQUEST, "You are the owner of the file, you can't share it with yourself");
                } else {
                    // check if user isn't already in shared list
                    if (file.sharedWith.indexOf(user._id) !== -1) {
                        throw new HTTPError(HttpCodes.BAD_REQUEST, "This user has already an access to this file");
                    }

                    // add user to share list
                    file.sharedWith.push(user._id);
                    await file.save();

                    // add key to the user
                    await EncryptionFileService.addFileKeyToUser(user, file, file_aes_key);

                    // generate email
                    const url: string = process.env.APP_FRONTEND_URL + "/shared-with-me";
                    await Mailer.sendTemplateEmail(otherUserEmail,
                        {
                            email: process.env.SENDGRID_MAIL_FROM,
                            name: process.env.SENDGRID_MAIL_FROM_NAME
                        },
                        process.env.SENDGRID_TEMPLATE_SHARED_WITH_YOU as string,
                        {
                            file_owner_email: currentUser.email,
                            filename: file.name,
                            url: url
                        }
                    );

                    status = "Success";
                }
            } else {
                // check if email is already in sharedWithPendingArray
                for(let i = 0; i < file.sharedWithPending.length; i++) {
                    if(file.sharedWithPending[i].email == otherUserEmail) {
                        throw new HTTPError(HttpCodes.BAD_REQUEST, "This user has already received an email to collaborate on this file.");
                    }
                }

                // add SharedWithPending Object to the database array
                const shared_with_pending_obj: ISharedWithPending = new SharedWithPending();
                shared_with_pending_obj.email = otherUserEmail;
                shared_with_pending_obj.file_aes_key = file_aes_key;

                file.sharedWithPending.push(shared_with_pending_obj);
                await file.save();

                // generate email
                const data: string = otherUserEmail + ";" + currentUser.email;
                const url: string = process.env.APP_FRONTEND_URL + "/register?data=" + data;
                await Mailer.sendTemplateEmail(otherUserEmail,
                    {
                        email: process.env.SENDGRID_MAIL_FROM,
                        name: process.env.SENDGRID_MAIL_FROM_NAME
                    },
                    process.env.SENDGRID_TEMPLATE_REQUEST_CREATE_ACCOUNT,
                    {
                        file_owner_email: currentUser.email,
                        filename: file.name,
                        url: url
                    }
                );

                status = "Waiting";
            }

            // reply
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: status
            });
        } catch (err) {
            next(err);
        }
    }

    public static async removeSharingAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const sharedWithUserEmail = req.params.email.toLowerCase();

            const file = requireNonNull(await File.findById(req.params.fileId).exec(), HttpCodes.NOT_FOUND, "File not found");
            FileService.requireFileIsDocument(file);
            await FileService.requireIsFileOwner(currentUser, file);

            let index = file.sharedWithPending.map(function(e) { return e.email; }).indexOf(sharedWithUserEmail);
            if (index !== -1) { // sharedWithUser exists in sharedWithpending
                // remove new user from sharedWithPending array
                await File.updateOne({_id: file._id}, { $pull: { "sharedWithPending": { "email": sharedWithUserEmail }} }).exec();
            } else {
                // get existing user and remove key from user
                const user = requireNonNull(await User.findOne({ "email": sharedWithUserEmail}).exec(), HttpCodes.NOT_FOUND, "User not found");
                await File.updateOne({_id: file._id}, { $pull: { "sharedWith": user._id} }).exec();
                await EncryptionFileService.removeFileKeyFromUser(user, file);
            }

            // reply
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success"
            });
        } catch (err) {
            next(err);
        }
    }

    // add a sign to the file
    public static async addSign(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = FileController._requireAuthenticatedUser(res);
            const file = requireNonNull(await File.findById(req.params.fileId).exec(), HttpCodes.NOT_FOUND, "File not found");
            const user_hash = requireUserHash(req);


            FileService.requireFileIsDocument(file);
            await FileService.requireFileCanBeViewed(currentUser, file);

            // sign the document
            await FileService.addSign(user_hash, currentUser, file);

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success"
            });
        } catch (err) {
            next(err);
        }
    }



    // set up functions
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
