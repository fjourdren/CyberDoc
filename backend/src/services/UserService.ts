import {IUser, Role, User} from '../models/User';
import {File, IFile} from '../models/File';

import {requireNonNull} from '../helpers/DataValidation';

import AuthService from './AuthService';
import FileService from './FileService';
import HTTPError from '../helpers/HTTPError';
import HttpCodes from '../helpers/HttpCodes';
import TwoFactorAuthService from './TwoFactorAuthService';

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
    public static async updateProfile(user_id: string | undefined, tokenBase64: string | undefined, firstname: string | undefined, lastname: string | undefined, email: string | undefined, password: string | undefined, phoneNumber: string | undefined, secret: string | undefined, twoFactorApp: boolean | undefined, twoFactorSms: boolean | undefined): Promise<Record<string, IUser | string>> {
        let user = requireNonNull(await User.findById(user_id).exec());

        if (!twoFactorApp && !twoFactorSms) {
            throw new HTTPError(HttpCodes.UNAUTHORIZED, 'You must keep at least one Two-Factor option');
        }
        if ((email != undefined && email != user.email)  // Change email
            || password != undefined                    // Change password
            || (phoneNumber != undefined && (user.twoFactorApp || user.twoFactorSms)) // 2FA by SMS added (only if 1 already exists)
            || (secret != undefined && (user.twoFactorApp || user.twoFactorSms))    // 2FA by APP added (only if 1 already exists)
            || (phoneNumber == undefined && !user.twoFactorSms) // Disable 2FA by SMS
            || (secret == undefined && !user.twoFactorApp)) { // Disable 2FA by APP
            if (!tokenBase64) {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
            }
            const decryptedToken = new Buffer(tokenBase64, 'base64').toString('ascii').split(':');
            if (decryptedToken.length != 3) {
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'Bad x-auth-token');
            }
            if (decryptedToken[2].length != 6) {
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'Token size should be equal to 6');
            }
            await AuthService.isPasswordValid(user.email, decryptedToken[0]);

            switch (decryptedToken[1]) {
                case 'app':
                    await TwoFactorAuthService.verifyTokenGeneratedByApp(user.email, secret, decryptedToken[2]);
                    break;
                case 'sms':
                    await TwoFactorAuthService.verifySMSToken(user.email, phoneNumber, decryptedToken[2]);
                    break;
                default:
                    throw new HTTPError(HttpCodes.BAD_REQUEST, 'appOrSms should be equal to app or sms');
            }
        }

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
        if (phoneNumber != undefined) {
            user.phoneNumber = phoneNumber;
        }
        if (secret != undefined) {
            user.secret = secret;
        }
        if (twoFactorApp != undefined) {
            user.twoFactorApp = twoFactorApp;
        }
        if (twoFactorSms != undefined) {
            user.twoFactorSms = twoFactorSms;
        }

        user = requireNonNull(await user.save());

        const newToken = AuthService.generateJWTToken(user, true);

        return {'user': user, 'newToken': newToken};
    }

    // delete user account service
    public static async delete(_id: string): Promise<IUser> {
        const user: IUser = requireNonNull(await User.findById(_id));
        const user_root: IFile = requireNonNull(await File.findById(user.directory_id));
        requireNonNull(await FileService.deleteDirectory(user_root, true)); // true => force root directory to be deleted
        return requireNonNull(await User.findByIdAndDelete(_id).exec());
    }
}

export default UserService;
