import { NextFunction, Request, Response } from 'express';
import { requireNonNull } from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'
import { IUser } from '../models/User';

import TwoFactorAuthService from '../services/TwoFactorAuthService';

class TwoFactorAuthController {
    // SEND TOKEN
    public static async sendTokenByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id } = req.body;
            let output: string;
            output = requireNonNull(await TwoFactorAuthService.sendToken('email', authy_id));
            console.log(output);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            next(err);
        }
    }

    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id } = req.body;
            let output: string;
            output = requireNonNull(await TwoFactorAuthService.sendToken('sms', authy_id));
            console.log(output);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            next(err);
        }
    }

    public static async sendPushNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id, email } = req.body;
            await TwoFactorAuthService.sendPushNotification(authy_id, email).then(output => {
                console.log(output);
                res.status(HttpCodes.OK);
                res.json(output);
            })
        } catch(err) {
            next(err);
        }
    }

    // VERIFY TOKEN
    public static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { authy_id, token } = req.body;
            let output = requireNonNull(await TwoFactorAuthService.verifyToken(authy_id, token));
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            next(err);
        }
    }
    
    public static async verifyPushNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { approval_request_id } = req.body;
            const output = requireNonNull(await TwoFactorAuthService.verifyPushNotification(approval_request_id));
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            next(err);
        }
    }
    

    // MANAGE 2FA
    public static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, phone_number, country_code } = req.body;
            const output = requireNonNull(await TwoFactorAuthService.add(email, phone_number, country_code));
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            next(err);
        }
    }
    
    public static async disable(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id } = req.body;
            const user: IUser = requireNonNull(await TwoFactorAuthService.disable(authy_id));
            res.status(HttpCodes.OK);
            res.json(JSON.stringify(user));
        } catch(err) {
            next(err);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id } = req.body;
            const output = requireNonNull(await TwoFactorAuthService.delete(authy_id));
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            next(err);
        }
    }

    public static async generateQrCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, authy_id} = req.body;
            const output = requireNonNull(await TwoFactorAuthService.generateQrCode(email, authy_id));
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            next(err);
        }
    }
}
export default TwoFactorAuthController;