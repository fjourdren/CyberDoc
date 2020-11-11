import * as twilio from 'twilio';
import {VerificationInstance} from 'twilio/lib/rest/verify/v2/service/verification';
import {VerificationCheckInstance} from 'twilio/lib/rest/verify/v2/service/verificationCheck';
import IUser, { User } from "../models/User";
import {v4 as uuidv4} from 'uuid';
import ITwoFactorRecoveryCode, {TwoFactorRecoveryCode} from '../models/TwoFactorRecoveryCode';
import HTTPError from '../helpers/HTTPError';
import HttpCodes from '../helpers/HttpCodes';

const twoFactor = require('node-2fa');

class TwoFactorAuthService {

    private static _client: twilio.Twilio;

    private static get client() {
        if (!TwoFactorAuthService._client) {
            TwoFactorAuthService._client = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
        return TwoFactorAuthService._client;
    }

    /**
     * Send 2FA token to specified user by SMS
     * @param phoneNumber
     */
    public static async sendTokenViaSMS(phoneNumber: string): Promise<VerificationInstance> {
        return TwoFactorAuthService.client.verify.services(process.env.TWILIO_SERVICE_ID)
            .verifications
            .create({to: phoneNumber, channel: 'sms'});
    }

    /**
     * Verify that the provided token is correct
     * @param phoneNumber
     * @param token
     */
    public static async verifySMSToken(phoneNumber: string, token: string): Promise<VerificationCheckInstance> {
        return TwoFactorAuthService.client.verify.services(process.env.TWILIO_SERVICE_ID)
            .verificationChecks
            .create({to: phoneNumber, code: token}).then(res => {
                return res;
            });
    }

    public static async generateSecretByEmail(email: string): Promise<any> {
        return twoFactor.generateSecret({name: 'CyberDoc', account: email});
    }

    public static async verifyTokenGeneratedByApp(secret: string, token: string): Promise<number> {
        return twoFactor.verifyToken(secret, token);
    }

    public static async generateRecoveryCodes(user: IUser): Promise<ITwoFactorRecoveryCode[]> {
        user.twoFactorRecoveryCodes = [];

        for (let i = 0; i < 5; i++) { // Generate 5 codes
            user.twoFactorRecoveryCodes[i] = new TwoFactorRecoveryCode({
                code: uuidv4(),
                isValid: true
            });
        }
        // update mongo data
        await User.updateOne({ _id: user._id }, { '$set': {twoFactorRecoveryCodes: user.twoFactorRecoveryCodes }});

        return user.twoFactorRecoveryCodes
    }

    public static async verifyRecoveryCode(user: IUser, code: string): Promise<void> {
        const recoveryCode: ITwoFactorRecoveryCode | undefined = user.twoFactorRecoveryCodes.find(filteredCode => filteredCode.code === code);
        if (recoveryCode === undefined) throw new HTTPError(HttpCodes.FORBIDDEN, 'Invalid recovery code');
        if (!recoveryCode.isValid) throw new HTTPError(HttpCodes.FORBIDDEN, 'Already used recovery code');
        const updateString = Object.assign({}, { 'twoFactorRecoveryCodes.$.isValid': false });
        await User.updateOne({ _id: user._id, 'twoFactorRecoveryCodes.code': code}, { '$set': updateString });
    }
}

export default TwoFactorAuthService;
