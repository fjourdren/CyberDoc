import {NextFunction, Request, Response} from 'express';
import {requireNonNull} from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'
import {IUser} from '../models/User';

import TwoFactorAuthService from '../services/TwoFactorAuthService';
import UserService from '../services/UserService';
import {VerificationInstance} from "twilio/lib/rest/verify/v2/service/verification";
import {VerificationCheckInstance} from "twilio/lib/rest/verify/v2/service/verificationCheck";

class TwoFactorAuthController {
    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber} = req.body;
            console.log('sendTokenBySms:', phoneNumber);
            const output: VerificationInstance = await TwoFactorAuthService.sendToken('sms', phoneNumber);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch (err) {
            next(err);
        }
    }

    public static async sendTokenByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;
            console.log('sendTokenByEmail:', email);
            const output: VerificationInstance = await TwoFactorAuthService.sendToken('email', email);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch (err) {
            next(err);
        }
    }

    public static async verifyTokenAppSmsEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {phoneNumber, email, secret, token} = req.body;
            console.log('verifyTokenAppSmsEmail:', secret, '/', phoneNumber, '/', email);
            if(secret) {
                await TwoFactorAuthService.verifyTokenGeneratedByApp(secret, token).then(delta => {
                    if(delta === null) throw new Error('Invalid token');
                    if(delta === -1) throw new Error('Token entered too late');
                    if(delta === 1) throw new Error('Token entered too early');
                })
                res.status(HttpCodes.OK);
                res.json({
                    success: true
                });
            } else if(phoneNumber || email){
                const output = await TwoFactorAuthService.verifyTokenByEmailOrSms(phoneNumber || email || secret, token);
                res.status(HttpCodes.OK);
                res.json(output);
            }
        } catch (err) {
            next(err);
        }
    }

    public static async checkStatusSms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user: IUser = requireNonNull(await UserService.profile(res.locals.APP_JWT_TOKEN.user._id));
            res.status(HttpCodes.OK);
            res.json(user.twoFactorSms);
        } catch (err) {
            next(err);
        }
    }

    public static async checkStatusEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user: IUser = requireNonNull(await UserService.profile(res.locals.APP_JWT_TOKEN.user._id));
            res.status(HttpCodes.OK);
            res.json(user.twoFactorEmail);
        } catch (err) {
            next(err);
        }
    }


    public static async generateSecretUriAndQr(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email} = req.body;
            const newSecret: any = requireNonNull(await TwoFactorAuthService.generateSecretByEmail(email));
            res.status(HttpCodes.OK);
            res.json(newSecret);
        } catch(err) {
            next(err);
        }
    }
}

export default TwoFactorAuthController;