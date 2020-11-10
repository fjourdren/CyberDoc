import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import TagService from '../services/TagService';

import IUser, { User } from '../models/User';
import CryptoHelper from '../helpers/CryptoHelper';
import EncryptionFileService from '../services/EncryptionFileService';
import { anyToReadable } from '../helpers/Conversions';
import { Readable } from 'stream';
import IUserEncryptionKeys, { UserEncryptionKeys } from '../models/UserEncryptionKeys';
import { requireFile, requireUserHash } from '../helpers/Utils';


class UserEncryptionController {

    public static async export(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // get objects
            const user_hash = requireUserHash(req);

            // get user updated
            const user: IUser = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec(), HttpCodes.BAD_REQUEST, "User not found");

            // get user's keys
            const public_key: string = (await EncryptionFileService.getPublicKey(user.email)).exportKey("public");
            const private_key: string = (await EncryptionFileService.getPrivateKey(user, user_hash)).exportKey("private");

            // generate file content
            const output_keys_file_content = public_key + "\n" + private_key;


            const output: Readable = anyToReadable(output_keys_file_content);

            // start the download
            res.set('Content-Type', 'application/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + user.email + '_keys.key"');
            res.status(HttpCodes.OK);
            output.pipe(res);
        } catch(err) {
            next(err);
        }
    }

    public static async import(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // get objects
            const user_hash = requireUserHash(req);

            // get user updated
            const user: IUser = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec(), HttpCodes.BAD_REQUEST, "User not found");

            // get file content
            const fileContents: any = requireFile(req, "upfile").buffer.toString();
            
            // get user's keys
            const cutContent: string[] = fileContents.split("-----BEGIN RSA PRIVATE KEY-----");
            const public_key: string = cutContent[0];
            const private_key: string = "-----BEGIN RSA PRIVATE KEY-----" + cutContent[1];

            // save keys to the user
            const user_keys: IUserEncryptionKeys = new UserEncryptionKeys();
            user_keys.public_key = public_key;
            user_keys.encrypted_private_key = CryptoHelper.encryptAES(user_hash, private_key);

            // reply to the user
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Your keys have been imported",
            });
        } catch(err) {
            next(err);
        }
    }
}

export default UserEncryptionController;