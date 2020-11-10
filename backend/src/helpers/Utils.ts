import { Request, Response } from 'express';
import { requireNonNull } from '../helpers/DataValidation';
import { IUser } from "../models/User";
import HttpCodes from '../helpers/HttpCodes'
import CryptoHelper from './CryptoHelper';

export function requireAuthenticatedUser(res: Response): IUser {
    return requireNonNull(res.locals.APP_JWT_TOKEN.user, HttpCodes.UNAUTHORIZED, "Auth is missing or invalid");
}

export function requireUserHash(req: Request): string {
    return CryptoHelper.prepareUser_hash(requireNonNull(req.cookies["user_hash"], HttpCodes.UNAUTHORIZED, "user_hash is missing or invalid"));
}

export function requireFile(req: Request, fieldName: string): Express.Multer.File {
    let file: Express.Multer.File | null = null;
    if (req.files) {
        for (file of (req.files as Express.Multer.File[])) {
            if (file.fieldname === fieldName) {
                break;
            }
        }
    }

    return requireNonNull(file, HttpCodes.BAD_REQUEST, `File missing (${fieldName})`)
}
