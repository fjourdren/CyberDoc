import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes';

import TwoFactorAuthService from '../services/TwoFactorAuthService';
import jwt from 'jsonwebtoken';
import HTTPError from '../helpers/HTTPError';

class TwoFactorAuthController {
    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber} = req.body;
            requireNonNull(phoneNumber);
            const verificationInstance = await TwoFactorAuthService.sendTokenViaSMS(phoneNumber);
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
            const {token} = req.body;
            requireNonNull(token);

            await TwoFactorAuthService.verifyTokenGeneratedByApp(res.locals.APP_JWT_TOKEN.user.email, token);

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
            const {token} = req.body;
            requireNonNull(token);

            const verificationInstance = await TwoFactorAuthService.verifySMSToken(res.locals.APP_JWT_TOKEN.user.phoneNumber, token);

            if (verificationInstance.status === 'approved') {
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
            } else {
                throw new HTTPError(HttpCodes.FORBIDDEN, 'Invalid token');
            }
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
}

export default TwoFactorAuthController;
