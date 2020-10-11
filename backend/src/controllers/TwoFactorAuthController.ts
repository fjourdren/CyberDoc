import { NextFunction, Request, Response } from 'express';
import { requireNonNull } from '../helpers/DataValidation';

import HttpCodes from '../helpers/HttpCodes'
import { IUser } from '../models/User';
import { AxiosError } from 'axios';

import TwoFactorAuthService from '../services/TwoFactorAuthService';

class TwoFactorAuthController {
    // SEND TOKEN
    public static async sendTokenByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id } = req.body;
            let output: string;
            output = await TwoFactorAuthService.sendToken('email', authy_id);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }

    public static async sendTokenBySms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id } = req.body;
            let output: string;
            output = await TwoFactorAuthService.sendToken('sms', authy_id);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }

    public static async sendPushNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id, email } = req.body;
            let output = await TwoFactorAuthService.sendPushNotification(authy_id, email);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }

    // VERIFY TOKEN
    public static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { authy_id, token } = req.body;
            let output = await TwoFactorAuthService.verifyToken(authy_id, token);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }

    public static async verifyPushNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { approval_request_id } = req.body;
            const output = await TwoFactorAuthService.verifyPushNotification(approval_request_id);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }
    

    // MANAGE 2FA
    public static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, phone_number, country_code } = req.body;
            const output = await TwoFactorAuthService.add(email, phone_number, country_code);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }


    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { authy_id } = req.body;
            const output = await TwoFactorAuthService.delete(authy_id);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }

    public static async generateQrCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, authy_id} = req.body;
            const output = await TwoFactorAuthService.generateQrCode(email, authy_id);
            res.status(HttpCodes.OK);
            res.json(output);
        } catch(err) {
            if (err.isAxiosError) { // no types
                const e: AxiosError = err;
                if(!e.response) res.status(HttpCodes.INTERNAL_ERROR);
                else {
                    res.status(e.response?.status ? e.response.status : HttpCodes.INTERNAL_ERROR);
                    res.json({
                        success: e.response?.data.success,
                        message: e.response?.data.message,
                        errors: e.response?.data.errors
                    });
                }
            }
            next(err);
        }
    }
}
export default TwoFactorAuthController;