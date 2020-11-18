import {IUser, Role, User} from '../models/User';
import {File, IFile} from '../models/File';

import {requireNonNull} from '../helpers/DataValidation';

import AuthService from "./AuthService";
import FileService from "./FileService";
import HttpCodes from "../helpers/HttpCodes";
import EncryptionFileService from "./EncryptionFileService";
import CryptoHelper from "../helpers/CryptoHelper";
import IUserEncryptionKeys, { UserEncryptionKeys } from "../models/UserEncryptionKeys";
import TwoFactorAuthService from './TwoFactorAuthService';
import HTTPError from '../helpers/HTTPError';

class UserService {

    // verify that a role is in a list
    public static hasRoles(rolesNeeded: Role[], role: Role): boolean {
        return rolesNeeded.includes(role);
    }

    // profile service
    public static async profile(userId: string): Promise<IUser> {
        return requireNonNull(await User.findById(userId).exec());
    }

    // profile update
    public static async updateProfile(user_hash: string | undefined, new_user_hash: string | undefined, user_id: string | undefined, tokenBase64: string | undefined, firstname: string | undefined, lastname: string | undefined, email: string | undefined, password: string | undefined, phoneNumber: string | undefined, secret: string | undefined, twoFactorApp: boolean | undefined, twoFactorSms: boolean | undefined): Promise<Record<string, IUser | string>> {
        let user = requireNonNull(await User.findById(user_id).exec());

        if ((twoFactorApp !== undefined || twoFactorSms !== undefined) && !twoFactorApp && !twoFactorSms) {
            throw new HTTPError(HttpCodes.UNAUTHORIZED, 'You must keep at least one Two-Factor option');
        }

        const firstTimeTwoFactorRegistering = !user.twoFactorSms && !user.twoFactorApp;

       // if you are trying to modify email, password or 2FA (not for the first time)
        if (((email != undefined && email !== user.email)
            || password != undefined
            || (twoFactorApp != undefined && twoFactorApp !== user.twoFactorApp)
            || (twoFactorSms != undefined && twoFactorSms !== user.twoFactorSms))
            && !firstTimeTwoFactorRegistering) {
            if (!tokenBase64) {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
            }
            const decryptedToken = new Buffer(tokenBase64, 'base64').toString('utf-8').split('\t');
            if ((twoFactorSms && !user.twoFactorSms) || (twoFactorApp && !user.twoFactorApp)) { // 2FA is added, check only password
                await AuthService.isPasswordValid(user.email, decryptedToken[0]);
            } else { // Check password and 2FA
                await UserService.securityCheck(decryptedToken, user);
            }
        }

        if(!firstTimeTwoFactorRegistering) { // Can't modify those attributes while no 2FA activated
            if (firstname != undefined) {
                user.firstname = firstname;
            }
            if (lastname != undefined) {
                user.lastname = lastname;
            }
            if (email != undefined) {
                user.email = email;
            }
            if (password != undefined) {
                user.password = password;
            }
        }

        if (twoFactorApp != undefined) {
            user.twoFactorApp = twoFactorApp;
            if(twoFactorApp) {
                if (secret != undefined) {
                    user.secret = secret;
                }
            } else {
                user.secret = undefined;
            }
        }

        if (twoFactorSms != undefined) {
            user.twoFactorSms = twoFactorSms;
            if(twoFactorSms) {
                if (phoneNumber != undefined) {
                    user.phoneNumber = phoneNumber;
                }
            } else {
                user.phoneNumber = undefined;
            }
        }

        requireNonNull(await user.save());


        // if email or password has been changed, we update the user's encryption private key value 
        if(user_hash != undefined && (email != undefined || password != undefined)) {
            requireNonNull(new_user_hash, HttpCodes.BAD_REQUEST, "You need to provide the new user_hash encryption key if you change the email or the password");
            if(new_user_hash) {
                // decrypt private key
                const user_privateKey: string = (await EncryptionFileService.getPrivateKey(user, user_hash)).exportKey("private");
    
                // reencrypt new private key
                const encrypted_private_key: string = CryptoHelper.encryptAES(new_user_hash, user_privateKey);

                // get public key
                const user_publicKey: string = (await EncryptionFileService.getPublicKey(user.email)).exportKey("public");

                // recreate new object
                let keys: IUserEncryptionKeys = new UserEncryptionKeys();
                keys.public_key = user_publicKey;
                keys.encrypted_private_key = encrypted_private_key.toString();

                await User.updateOne({_id: user._id}, {$set: { 'userKeys': keys }});
            }
        }

        const newToken = AuthService.generateJWTToken(user, true);

        return {'user': user, 'newToken': newToken};
    }

    // Export Files Data
    public static async getAllFiles(user: IUser): Promise<IFile[]> {
        return await File.find({owner_id: user._id}).exec();
    }

    // delete user account service
    public static async delete(user: IUser, tokenBase64: string | undefined): Promise<IUser> {
        if (!tokenBase64) {
            throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
        }
        const decryptedToken = new Buffer(tokenBase64, 'base64').toString('utf-8').split('\t');

        await this.securityCheck(decryptedToken, user);
        const user_root: IFile = requireNonNull(await File.findById(user.directory_id));
        requireNonNull(await FileService.deleteDirectory(user_root, true)); // true => force root directory to be deleted
        return requireNonNull(await User.findByIdAndDelete(user).exec());
    }

    public static async securityCheck(decryptedToken: string[], user: IUser): Promise<void> {
        if (decryptedToken.length <= 0) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, 'Bad x-auth-token');
        }

        const password = decryptedToken[0];
        const appOrSmsOrRecoveryCode = decryptedToken[1];
        const tokenOrCode = decryptedToken[2];

        if ((appOrSmsOrRecoveryCode === 'app' || appOrSmsOrRecoveryCode === 'sms')
            && tokenOrCode.length !== 6) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, 'Token size must be equal to 6');
        } else if(appOrSmsOrRecoveryCode === 'recoveryCode' && tokenOrCode.length !== 36) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, 'Recovery code size must be equal to 36');
        }

        await AuthService.isPasswordValid(user.email, password);

        switch (appOrSmsOrRecoveryCode) {
            case 'app':
                await TwoFactorAuthService.verifyTokenGeneratedByApp(user.email, user.secret, tokenOrCode);
                break;
            case 'sms':
                await TwoFactorAuthService.verifySMSToken(user.email, user.phoneNumber, tokenOrCode);
                break;
            case 'recoveryCode':
                await TwoFactorAuthService.verifyUsedRecoveryCode(user.email, tokenOrCode);
                break;
            default:
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'appOrSms must be equal to app or sms');
        }
    }
}

export default UserService;
