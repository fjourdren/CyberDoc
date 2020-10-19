import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'

import TwoFactorAuthService from '../services/TwoFactorAuthService';
import jwt from "jsonwebtoken";

class TwoFactorAuthController {
    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber} = req.body;
            if (phoneNumber) {
                await TwoFactorAuthService.sendToken('sms', phoneNumber).then(verifInstance => {
                    res.status(HttpCodes.OK);
                    res.json(verifInstance);
                });
            } else {
                res.status(HttpCodes.BAD_REQUEST);
                res.json({
                    success: false,
                    msg: 'phoneNumber is required'
                })
            }
        } catch (err) {
            next(err);
        }
    }

    public static async sendTokenByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;
            if (email) {
                await TwoFactorAuthService.sendToken('email', email).then(verifInstance => {
                    res.status(HttpCodes.OK);
                    res.json(verifInstance);
                });
            } else {
                res.status(HttpCodes.BAD_REQUEST);
                res.json({
                    success: false,
                    msg: 'phoneNumber is required'
                })
            }
        } catch (err) {
            next(err);
        }
    }

    public static async verifyTokenAppSmsEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber, email, secret, token} = req.body;
            let jwtToken: string;
            let output: boolean;
            if (secret) {
                await TwoFactorAuthService.verifyTokenGeneratedByApp(secret, token).then(delta => {
                    if (delta === null) throw new Error('Invalid token');
                    if (delta === -1) throw new Error('Token entered too late');
                    if (delta === 1) throw new Error('Token entered too early');
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
                });
            } else if (phoneNumber || email) {
                await TwoFactorAuthService.verifyTokenByEmailOrSms(phoneNumber || email, token).then(promise => {
                    jwtToken = jwt.sign({
                        user: res.locals.APP_JWT_TOKEN.user,
                        authorized: true
                    }, process.env.JWT_SECRET, {
                        expiresIn: 36000
                    });
                    output = promise.status === 'approved';
                    res.status(HttpCodes.OK);
                    res.json({
                        success: output,
                        token: jwtToken
                    });
                });
            } else {
                res.status(HttpCodes.BAD_REQUEST);
                res.json({
                    success: false,
                    msg: "Request should have either secret, phoneNumber or email."
                });
            }
        } catch (err) {
            next(err);
        }
    }

    public static async generateSecretUriAndQr(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;
            const secretUriAndQr: any = requireNonNull(await TwoFactorAuthService.generateSecretByEmail(email));
            if (email) {
                res.status(HttpCodes.OK);
                res.json(secretUriAndQr);
            } else {
                res.status(HttpCodes.BAD_REQUEST);
                res.json({
                    success: false,
                    msg: 'Email is required'
                });
            }
        } catch (err) {
            next(err);
        }
    }
}

export default TwoFactorAuthController;