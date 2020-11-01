import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import UserService from '../services/UserService';

import IUser, { User } from '../models/User';

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
            const { firstname, lastname, email, password, phoneNumber, secret, twoFactorApp, twoFactorSms} = req.body;
            // if we are using a change password token to access, then we allow user only to change his password
            if(res.locals.APP_JWT_TOKEN.email) {
                const user_email = res.locals.APP_JWT_TOKEN.email;
                const user: IUser = requireNonNull(await User.findOne({ email: user_email.toLowerCase() }).exec());

                requireNonNull(await UserService.updateProfile(user._id, undefined, undefined, undefined, password, undefined, undefined,undefined, undefined));

                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "Password changed"
                });
            } else {
                const user_id = res.locals.APP_JWT_TOKEN.user._id;
                const output: Record<string, IUser | string> = requireNonNull(await UserService.updateProfile(user_id, firstname, lastname, email, password, phoneNumber, secret, twoFactorApp, twoFactorSms));
                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "Profile updated",
                    user: output.user,
                    token: output.newToken
                });
            }

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