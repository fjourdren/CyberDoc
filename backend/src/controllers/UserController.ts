import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import UserService from '../services/UserService';

import IUser, { User } from '../models/User';
import HTTPError from '../helpers/HTTPError';
import AuthService from '../services/AuthService';
import TwoFactorAuthService from '../services/TwoFactorAuthService';

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

                requireNonNull(await UserService.updateProfile(user._id, undefined, undefined, undefined, undefined, password, undefined, undefined, undefined, undefined));

                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: "Password changed"
                });
            } else {
                const user_id = res.locals.APP_JWT_TOKEN.user._id;
                const output: Record<string, IUser | string> = requireNonNull(await UserService.updateProfile(user_id, req.header('x-auth-token'), firstname, lastname, email, password, phoneNumber, secret, twoFactorApp, twoFactorSms));
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
            const user: IUser = requireNonNull(await User.findOne({ email: res.locals.APP_JWT_TOKEN.user.email.toLowerCase() }).exec());

            const tokenBase64 = req.header('x-auth-token');
            if (!tokenBase64) {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
            }
            const decryptedToken = new Buffer(tokenBase64, 'base64').toString('ascii').split(':');
            if(decryptedToken.length != 3) {
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'Bad x-auth-token');
            }
            if(decryptedToken[2].length != 6) {
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'Token size should be equal to 6');
            }
            await AuthService.isPasswordValid(user.email, decryptedToken[0]);

            switch(decryptedToken[1]) {
                case 'app':
                    await TwoFactorAuthService.verifyTokenGeneratedByApp(user.email, undefined, decryptedToken[2]);
                    break;
                case 'sms':
                    await TwoFactorAuthService.verifySMSToken(user.email, undefined, decryptedToken[2]);
                    break;
                default:
                    throw new HTTPError(HttpCodes.BAD_REQUEST, "appOrSms should be equal to app or sms");
            }
            await UserService.delete(user._id);

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
