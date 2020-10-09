import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import { User } from '../models/User';
import TagService from '../services/TagService';
import IFile, { File } from '../models/File';
import ITag, { Tag } from '../models/Tag';
import IUser from '../models/User';
import HTTPError from '../helpers/HTTPError';

class FileTagController {

    public static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileId: string = req.params.fileId;
            const { tagId }      = req.body;

            // check non null
            requireNonNull(fileId);
            requireNonNull(tagId);

            // get objects
            const file: IFile  = requireNonNull(await File.findById(fileId).exec());
            const user: IUser = requireNonNull(await User.findOne({_id: res.locals.APP_JWT_TOKEN.user._id, 'tags': { $elemMatch: { _id: tagId } } }).exec());

            // find the good tag in the list
            let tag: ITag = new Tag();
            for(let i = 0; i < user.tags.length; i++) {
                tag = user.tags[i];
                if(tagId == tag.id)
                    break;
            }

            if(tagId != tag._id)
                throw new HTTPError(HttpCodes.NOT_FOUND, "Unknown tag");

            // check that user is owner
            if (file.owner_id != res.locals.APP_JWT_TOKEN.user._id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            // add tag
            requireNonNull(await TagService.addToFile(file, tag));

            // reply client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Tag added to the file"
            });
        } catch(err) {
            next(err);
        }
    }

    public static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileId: string = req.params.fileId;
            const tagId: string  = req.params.tagId;

            // check non null
            requireNonNull(fileId);
            requireNonNull(tagId);

            // get file from fileID
            const file: IFile = requireNonNull(await File.findById(fileId).exec())

            // check that user is owner
            if (file.owner_id != res.locals.APP_JWT_TOKEN.user._id)
                throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't owner");

            // remove tag
            requireNonNull(await TagService.removeFromFile(file, tagId));

            // reply client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Tag removed from file",
            });
        } catch(err) {
            next(err);
        }
    }
}

export default FileTagController;