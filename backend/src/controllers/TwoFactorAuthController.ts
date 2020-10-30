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
            if(err.code && err.code === 60200) next(new HTTPError(HttpCodes.BAD_REQUEST, "This phone number is invalid"));
            else next(err);
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
            if(err.code && err.code === 60200) next(new HTTPError(HttpCodes.BAD_REQUEST, "This email is invalid"));
            else next(err);
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
                if (delta === null || delta === -1 || delta === 1) throw new HTTPError(HttpCodes.BAD_REQUEST, "Invalid token");

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
                if(verificationInstance.status === 'approved') {
                    res.status(HttpCodes.OK);
                    res.json({
                        success: true,
                        token: jwtToken
                    });
                } else throw new HTTPError(HttpCodes.UNAUTHORIZED, "Invalid token");
            } else {
                throw new HTTPError(HttpCodes.BAD_REQUEST, "Request should have either secret, phoneNumber or email.");
            }
        } catch (err) {
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
           next(err);
        }
    }
}

export default TwoFactorAuthController;