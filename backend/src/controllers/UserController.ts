import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import UserService from '../services/UserService';

import IUser, { User } from '../models/User';
import CryptoHelper from '../helpers/CryptoHelper';
import {requireAuthenticatedUser} from '../helpers/Utils';
import {IFile} from '../models/File';

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
            const { firstname, lastname, email, password, phoneNumber, secret, twoFactorApp, twoFactorSms } = req.body;
            
            // cut too long user_hash
            const user_hash     = CryptoHelper.prepareUser_hash(req.body.user_hash);
            const new_user_hash = CryptoHelper.prepareUser_hash(req.body.new_user_hash);
            
            // if we are using a change password token to access, then we allow user only to change his password
            if(res.locals.APP_JWT_TOKEN.email) {
                const user_email = res.locals.APP_JWT_TOKEN.email;
                const user: IUser = requireNonNull(await User.findOne({ email: user_email.toLowerCase() }).exec());

                requireNonNull(await UserService.updateProfile(undefined, undefined, user._id, undefined, undefined, undefined, password, undefined, undefined,undefined, undefined));

                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "Password changed"
                });
            } else {
                const user_id = res.locals.APP_JWT_TOKEN.user._id;
                const output: Record<string, IUser | string> = requireNonNull(await UserService.updateProfile(user_hash, new_user_hash, user_id, firstname, lastname, email, password, phoneNumber, secret, twoFactorApp, twoFactorSms));
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


    // Export files data
    public static async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = requireAuthenticatedUser(res);
            const filesData: IFile[] = await UserService.exportData(currentUser.directory_id);
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Success",
                filesData
            });
        } catch (err) {
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
