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

        if ((twoFactorApp !== undefined || twoFactorSms !== undefined) && !twoFactorApp && !twoFactorSms) {
            throw new HTTPError(HttpCodes.UNAUTHORIZED, 'You must keep at least one Two-Factor option');
        }

        const firstTimeTwoFactorRegistering = !user.twoFactorSms && !user.twoFactorApp;

       // if you are trying to modify email, password or 2FA (not for the first time)
        if (((email != undefined && email !== user.email) || password != undefined)
            && !firstTimeTwoFactorRegistering) {
            if (!tokenBase64) {
                throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
            }
            const decryptedToken = new Buffer(tokenBase64, 'base64').toString('ascii').split(':');
            if ((twoFactorSms && !user.twoFactorSms) || (twoFactorApp && !user.twoFactorApp)) { // 2FA is added, check only password
                await AuthService.isPasswordValid(user.email, decryptedToken.join(':'));
            } else { // Check password and 2FA
                await UserService.securityCheck(decryptedToken, secret, phoneNumber, user);
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

        user = requireNonNull(await user.save());

        const newToken = AuthService.generateJWTToken(user, true);

        return {'user': user, 'newToken': newToken};
    }

    // delete user account service
    public static async delete(user: IUser, tokenBase64: string | undefined): Promise<IUser> {
        if (!tokenBase64) {
            throw new HTTPError(HttpCodes.UNAUTHORIZED, 'No X-Auth-Token : authorization denied');
        }
        const decryptedToken = new Buffer(tokenBase64, 'base64').toString('ascii').split(':');

        await this.securityCheck(decryptedToken, undefined, undefined, user);
        const user_root: IFile = requireNonNull(await File.findById(user.directory_id));
        requireNonNull(await FileService.deleteDirectory(user_root, true)); // true => force root directory to be deleted
        return requireNonNull(await User.findByIdAndDelete(user).exec());
    }

    private static async securityCheck(decryptedToken: string[], secret: string | undefined, phoneNumber: string | undefined, user: IUser) {
        if (decryptedToken.length <= 0) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, 'Bad x-auth-token');
        }

        const password = decryptedToken.slice(0, decryptedToken.length - 2).join(':'); // If password has ':' chars
        console.log(password);
        const appOrSms = decryptedToken[decryptedToken.length - 2];
        const token = decryptedToken[decryptedToken.length - 1];

        if (token.length != 6) {
            throw new HTTPError(HttpCodes.BAD_REQUEST, 'Token size must be equal to 6');
        }

        await AuthService.isPasswordValid(user.email, password);

        switch (appOrSms) {
            case 'app':
                await TwoFactorAuthService.verifyTokenGeneratedByApp(user.email, secret || user.secret, token);
                break;
            case 'sms':
                await TwoFactorAuthService.verifySMSToken(user.email, phoneNumber || user.phoneNumber, token);
                break;
            default:
                throw new HTTPError(HttpCodes.BAD_REQUEST, 'appOrSms must be equal to app or sms');
        }
    }
}

export default UserService;
