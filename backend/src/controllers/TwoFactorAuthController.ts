import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes';

import TwoFactorAuthService from '../services/TwoFactorAuthService';
import jwt from 'jsonwebtoken';
import HTTPError from '../helpers/HTTPError';
import {IUser, User} from '../models/User';
import ITwoFactorRecoveryCode from '../models/TwoFactorRecoveryCode';
import UserService from '../services/UserService';

class TwoFactorAuthController {
    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber} = req.body;

            let verificationInstance;
            if(res.locals.APP_JWT_TOKEN.user.phoneNumber) { // 2FA by SMS already registered
                verificationInstance = await TwoFactorAuthService.sendTokenViaSMS(res.locals.APP_JWT_TOKEN.user.phoneNumber);
            } else if(requireNonNull(phoneNumber)) { //
                verificationInstance = await TwoFactorAuthService.sendTokenViaSMS(phoneNumber);
            }

            res.status(HttpCodes.OK);
            res.json(verificationInstance);
        } catch (err) {
            if (err.code && err.code === 60200) {
                next(new HTTPError(HttpCodes.BAD_REQUEST, 'This phone number is invalid'));
            } else if (err.code && err.status === 429) {
                next(new HTTPError(HttpCodes.TOO_MANY_REQUESTS, 'Max send attempts reached'));
            } else {
                next(err);
            }
        }
    }

    public static async verifyTokenApp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {secret, token} = req.body;
            requireNonNull(token);

            await TwoFactorAuthService.verifyTokenGeneratedByApp(res.locals.APP_JWT_TOKEN.user.email, secret, token);

            const jwtToken = jwt.sign({
                user: res.locals.APP_JWT_TOKEN.user,
                authorized: true
            }, process.env.JWT_SECRET, {
                expiresIn: 36000
            });
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                token: jwtToken
            });
        } catch (err) {
            if (err.code && err.status === 429) {
                next(new HTTPError(HttpCodes.TOO_MANY_REQUESTS, 'Max check attempts reached'));
            } else {
                next(err);
            }
        }
    }

    public static async verifyTokenSms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber, token} = req.body;
            requireNonNull(token);

            await TwoFactorAuthService.verifySMSToken(res.locals.APP_JWT_TOKEN.user.email, phoneNumber, token);

            const jwtToken = jwt.sign({
                user: res.locals.APP_JWT_TOKEN.user,
                authorized: true
            }, process.env.JWT_SECRET, {
                expiresIn: 36000
            });

            res.status(HttpCodes.OK);
            res.json({
                success: true,
                token: jwtToken
            });
        } catch (err) {
            if (err.code && err.status === 429) {
                next(new HTTPError(HttpCodes.TOO_MANY_REQUESTS, 'Max check attempts reached'));
            } else {
                next(err);
            }
        }
    }

    public static async generateSecretUriAndQr(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;

            requireNonNull(email);

            const secretUriAndQr: any = requireNonNull(await TwoFactorAuthService.generateSecretByEmail(email));

            res.status(HttpCodes.OK);
            res.json(secretUriAndQr);
        } catch (err) {
            next(err);
        }
    }

    public static async useRecoveryCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {code} = req.body;
            requireNonNull(code);

            await TwoFactorAuthController._requireAuthenticatedUser(res).then(async user => {
                const recoveryCodesLeft = await TwoFactorAuthService.useRecoveryCode(user, code);
                const jwtToken = jwt.sign({
                    user: res.locals.APP_JWT_TOKEN.user,
                    authorized: true
                }, process.env.JWT_SECRET, {
                    expiresIn: 36000
                });
                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: 'Recovery code used',
                    token: jwtToken,
                    recoveryCodesLeft
                });
            });
        } catch (err) {
            next(err);
        }
    }


    public static async generateRecoveryCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tokenBase64 = req.header('x-auth-token');
            if (!tokenBase64) {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
            }
            const decryptedToken = new Buffer(tokenBase64, 'base64').toString('utf-8').split('\t');

            await TwoFactorAuthController._requireAuthenticatedUser(res).then(async user => {
                await UserService.securityCheck(decryptedToken, user);
                const recoveryCodes: ITwoFactorRecoveryCode[] = requireNonNull(await TwoFactorAuthService.generateRecoveryCodes(user));
                res.status(HttpCodes.OK);
                res.json({
                    success: true,
                    msg: recoveryCodes.length + ' Two-Factor recovery codes have been generated.',
                    recoveryCodes: recoveryCodes.map(rc => rc.code)
                });
            });
        } catch (err) {
            next(err);
        }
    }

    private static async _requireAuthenticatedUser(res: Response): Promise<IUser> {
        return requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec())
    }
}

export default TwoFactorAuthController;
