import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import UserService from '../services/UserService';

import IUser from '../models/User';
import ITag, { Tag, TagSchema } from '../models/Tag';
import TagService from '../services/TagService';

class UserTagController {

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, color } = req.body;

            const savedTag: ITag = requireNonNull(await TagService.create(res.locals.APP_JWT_TOKEN.user, name, color));
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Tag created",
                tag: savedTag
            });
        } catch(err) {
            next(err);
        }
    }

    public static async edit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // get objects
            const user: IUser = res.locals.APP_JWT_TOKEN.user;

            const tagId: string = req.params.tagId;

            const newName: string  = req.body.name;
            const newColor: string = req.body.color;

            // get tag
            const tag: ITag = requireNonNull(await Tag.findById(tagId));

            // edit tag
            await TagService.edit(user, tag, newName, newColor);
            
            // reply user
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Tag updated"
            });
        } catch(err) {
            next(err);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tagId = req.params.fileId;

            requireNonNull(tagId);

            await TagService.delete(res.locals.APP_JWT_TOKEN.user, tagId);

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Tag deleted",
            });
        } catch(err) {
            next(err);
        }
    }
}

export default UserTagController;