import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'

import TwoFactorAuthService from '../services/TwoFactorAuthService';
import jwt from "jsonwebtoken";
import HTTPError from '../helpers/HTTPError';
import {IUser} from '../models/User';
import ITwoFactorRecoveryCode from '../models/TwoFactorRecoveryCode';

class TwoFactorAuthController {
    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber} = req.body;
            requireNonNull(phoneNumber);
            const verificationInstance = await TwoFactorAuthService.sendTokenViaSMS(phoneNumber);
            res.status(HttpCodes.OK);
            res.json(verificationInstance);
        } catch (err) {
            if(err.code && err.code === 60200) next(new HTTPError(HttpCodes.BAD_REQUEST, "This phone number is invalid"));
            else if(err.code && err.status === 429) next(new HTTPError(HttpCodes.TOO_MANY_REQUESTS, "Max send attempts reached"));
            else next(err);
        }
    }

    public static async verifyTokenAppSms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber, secret, token} = req.body;
            // Check that token exists
            requireNonNull(token);
            let jwtToken: string;
            let output: boolean;
            if (secret) {
                const delta = await TwoFactorAuthService.verifyTokenGeneratedByApp(secret, token);
                if (delta === null || delta === -1 || delta === 1) throw new HTTPError(HttpCodes.FORBIDDEN, "Invalid token");

                jwtToken = jwt.sign({
                    user: res.locals.APP_JWT_TOKEN.user,
                    authorized: true
                }, process.env.JWT_SECRET, {
                    expiresIn: 36000
                });
                output = true;
                res.status(HttpCodes.OK);
                res.json({
                    success: output,
                    token: jwtToken
                });
            } else if (phoneNumber) {
                const verificationInstance = await TwoFactorAuthService.verifySMSToken(phoneNumber, token);
                jwtToken = jwt.sign({
                    user: res.locals.APP_JWT_TOKEN.user,
                    authorized: true
                }, process.env.JWT_SECRET, {
                    expiresIn: 36000
                });
                if(verificationInstance.status === 'approved') {
                    res.status(HttpCodes.OK);
                    res.json({
                        success: true,
                        token: jwtToken
                    });
                } else throw new HTTPError(HttpCodes.FORBIDDEN, "Invalid token");
            } else {
                throw new HTTPError(HttpCodes.BAD_REQUEST, "Request should have either secret, phoneNumber.");
            }
        } catch (err) {
            if(err.code && err.status === 429) next(new HTTPError(HttpCodes.TOO_MANY_REQUESTS, "Max check attempts reached"));
            else next(err);
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

    public static async verifyRecoveryCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {code} = req.body;
            requireNonNull(code);

            const currentUser = TwoFactorAuthController._requireAuthenticatedUser(res);
            await TwoFactorAuthService.verifyRecoveryCode(currentUser, code);
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
                token: jwtToken
            });
        } catch (err) {
            next(err);
        }
    }


    public static async generateRecoveryCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUser = TwoFactorAuthController._requireAuthenticatedUser(res);
            const recoveryCodes: ITwoFactorRecoveryCode[] = requireNonNull(await TwoFactorAuthService.generateRecoveryCodes(currentUser));
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: '5 Two-Factor recovery codes have been generated.',
                recoveryCodes: recoveryCodes.map(rc => rc.code)
            });
        } catch (err) {
            next(err);
        }
    }

    private static _requireAuthenticatedUser(res: Response): IUser {
        return requireNonNull(res.locals.APP_JWT_TOKEN.user, HttpCodes.UNAUTHORIZED, "Auth is missing or invalid");
    }
}

export default TwoFactorAuthController;
