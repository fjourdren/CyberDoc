import * as twilio from 'twilio';
import {VerificationInstance} from 'twilio/lib/rest/verify/v2/service/verification';
import {VerificationCheckInstance} from 'twilio/lib/rest/verify/v2/service/verificationCheck';
import { IUser, User } from "../models/User";
import {v4 as uuidv4} from 'uuid';
import ITwoFactorRecoveryCode, {TwoFactorRecoveryCode} from '../models/TwoFactorRecoveryCode';
import HTTPError from '../helpers/HTTPError';
import HttpCodes from '../helpers/HttpCodes';
import {requireNonNull} from '../helpers/DataValidation';

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
     * @param email
     * @param phoneNumber
     * @param token
     */
    public static async verifySMSToken(email: string, phoneNumber: string | undefined,  token: string): Promise<VerificationCheckInstance> {
        const user: IUser = requireNonNull(await User.findOne({email: email}).exec(), HttpCodes.UNAUTHORIZED, "Invalid user");
        let verificationInstance;
        if(phoneNumber) { // Registering => Currently no phoneNumber registered in DB
            verificationInstance = await TwoFactorAuthService.client.verify.services(process.env.TWILIO_SERVICE_ID)
                .verificationChecks
                .create({to: phoneNumber, code: token}).then(res => {
                    return res;
                });
        } else { // Checking
            verificationInstance = await TwoFactorAuthService.client.verify.services(process.env.TWILIO_SERVICE_ID)
                .verificationChecks
                .create({to: user.phoneNumber, code: token}).then(res => {
                    return res;
                });
        }

        if(verificationInstance.status !== 'approved') {
            throw new HTTPError(HttpCodes.FORBIDDEN, 'Invalid token');
        }

        return verificationInstance;
    }

    public static async generateSecretByEmail(email: string): Promise<any> {
        return twoFactor.generateSecret({name: 'CyberDoc', account: email});
    }

    public static async verifyTokenGeneratedByApp(email: string, secret: string | undefined, token: string): Promise<boolean> {
        const user: IUser = requireNonNull(await User.findOne({email: email}).exec(), HttpCodes.UNAUTHORIZED, "Invalid user");
        let delta;
        if(secret) { // Register => Currently no secret registered in DB
            delta = twoFactor.verifyToken(secret, token);
        } else { // Verify
            requireNonNull(user.secret);
            delta = twoFactor.verifyToken(user.secret, token);
        }

        if (delta === null || delta === -1 || delta === 1) {
            throw new HTTPError(HttpCodes.FORBIDDEN, 'Invalid token');
        }

        return true;
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

        return user.twoFactorRecoveryCodes;
    }

    public static async useRecoveryCode(user: IUser, code: string): Promise<boolean> {
        const recoveryCode: ITwoFactorRecoveryCode | undefined = user.twoFactorRecoveryCodes.find(filteredCode => filteredCode.code === code);
        if (recoveryCode === undefined) throw new HTTPError(HttpCodes.FORBIDDEN, 'Invalid recovery code');
        if (!recoveryCode.isValid) throw new HTTPError(HttpCodes.FORBIDDEN, 'Already used recovery code');
        const updateString = Object.assign({}, { 'twoFactorRecoveryCodes.$.isValid': false });
        await User.updateOne({ _id: user._id, 'twoFactorRecoveryCodes.code': code}, { '$set': updateString });
        return user.twoFactorRecoveryCodes.filter(c => c.isValid).length > 1;
    }

    public static async verifyUsedRecoveryCode(email: string, tokenOrCode: string): Promise<boolean> {
        const user: IUser = requireNonNull(await User.findOne({email: email}).exec(), HttpCodes.UNAUTHORIZED, "Invalid user");
        return user.twoFactorRecoveryCodes.find(code => code.code === tokenOrCode) !== undefined;
    }
}

export default TwoFactorAuthService;
