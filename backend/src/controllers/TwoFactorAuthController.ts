import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'

import TwoFactorAuthService from '../services/TwoFactorAuthService';
import jwt from "jsonwebtoken";
import HTTPError from '../helpers/HTTPError';

class TwoFactorAuthController {
    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber} = req.body;
            requireNonNull(phoneNumber);
            const verificationInstance = await TwoFactorAuthService.sendToken('sms', phoneNumber);
            res.status(HttpCodes.OK);
            res.json(verificationInstance);
        } catch (err) {
            res.status(HttpCodes.FORBIDDEN);
            res.json({
                success: false,
                msg: err.message
            });
            next(err);
        }
    }

    public static async sendTokenByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;
            requireNonNull(email);
            const verificationInstance = await TwoFactorAuthService.sendToken('email', email);
            res.status(HttpCodes.OK);
            res.json(verificationInstance);
        } catch (err) {
            res.status(HttpCodes.FORBIDDEN);
            res.json({
                success: false,
                msg: err.message
            });
            next(err);
        }
    }

    public static async verifyTokenAppSmsEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber, email, secret, token} = req.body;
            // Check that token exists
            requireNonNull(token);
            let jwtToken: string;
            let output: boolean;
            if (secret) {
                const delta = await TwoFactorAuthService.verifyTokenGeneratedByApp(secret, token);
                if (delta === null) throw new HTTPError(HttpCodes.BAD_REQUEST, "Invalid token");
                else if (delta === -1) throw new HTTPError(HttpCodes.BAD_REQUEST, "Token entered too late");
                else if (delta === 1) throw new HTTPError(HttpCodes.BAD_REQUEST, "Token entered too early");

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
            } else if (phoneNumber || email) {
                const verificationInstance = await TwoFactorAuthService.verifyTokenByEmailOrSms(phoneNumber || email, token);
                jwtToken = jwt.sign({
                    user: res.locals.APP_JWT_TOKEN.user,
                    authorized: true
                }, process.env.JWT_SECRET, {
                    expiresIn: 36000
                });
                output = verificationInstance.status === 'approved';
                res.status(HttpCodes.OK);
                res.json({
                    success: output,
                    token: jwtToken
                });
            } else {
                throw new HTTPError(HttpCodes.BAD_REQUEST, "Request should have either secret, phoneNumber or email.");
            }
        } catch (err) {
            res.status(err.statusCode);
            res.json({
                success: false,
                msg: err.message
            });
            next(err);
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
            res.status(HttpCodes.FORBIDDEN);
            res.json({
                success: false,
                msg: err.message
            });
            next(err);
        }
    }
}

export default TwoFactorAuthController;