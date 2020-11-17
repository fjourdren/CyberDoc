import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import TagService from '../services/TagService';

import { User } from '../models/User';
import HTTPError from '../helpers/HTTPError';


class UserTagController {

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, color } = req.body;
            const user = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec());

            for (const tag of user.tags){
                if (tag.name === name) {
                    throw new HTTPError(HttpCodes.BAD_REQUEST, "Another tag with the same name already exists");
                }
            }

            const savedTag = requireNonNull(await TagService.create(user, name, color));

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
            const tagId: string = req.params.tagId;
            const newName: string  = req.body.name;
            const newColor: string = req.body.color;

            let user = await User.findOne({_id: res.locals.APP_JWT_TOKEN.user._id, 'tags': { $elemMatch: { _id: tagId } } }).exec();
            user = requireNonNull(user, HttpCodes.NOT_FOUND, "Tag not found for this user");

            const tagToEdit = requireNonNull(user.tags.find(tag => tag.id === tagId));
            if (tagToEdit.name !== newName){
                for (const tag of user.tags){
                    if (tag.name === newName) {
                        throw new HTTPError(HttpCodes.BAD_REQUEST, "Another tag with the same name already exists");
                    }
                }    
            }

            await TagService.edit(user, tagToEdit, newName, newColor);
            
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
            const user = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec());
            const tagId = requireNonNull(req.params.tagId, HttpCodes.BAD_REQUEST, "Missing tagId path parameter");
            await TagService.delete(user, tagId);

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
