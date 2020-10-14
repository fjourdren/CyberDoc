import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import UserService from '../services/UserService';

import IUser from '../models/User';

class UserController {

    public static async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user: IUser = requireNonNull(await UserService.profile(res.locals.APP_JWT_TOKEN.user._id));
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success",
                user: user
            });
        } catch(err) {
            next(err);
        }
    }

    public static async settings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user_id = res.locals.APP_JWT_TOKEN.user._id;

            const { firstname, lastname, email, password } = req.body;

            const output: Record<string, IUser | string> = requireNonNull(await UserService.updateProfile(user_id, firstname, lastname, email, password));
            
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Profile updated",
                user: output.user,
                token: output.newToken
            });
        } catch(err) {
            next(err);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await UserService.delete(res.locals.APP_JWT_TOKEN.user._id);

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "User deleted",
            });
        } catch(err) {
            next(err);
        }
    }
}

export default UserController;