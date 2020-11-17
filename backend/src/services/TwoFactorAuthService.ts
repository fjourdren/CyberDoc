import * as twilio from 'twilio';
import {VerificationInstance} from "twilio/lib/rest/verify/v2/service/verification";
import {VerificationCheckInstance} from "twilio/lib/rest/verify/v2/service/verificationCheck";
import {IUser, User} from '../models/User';
import {requireNonNull} from '../helpers/DataValidation';
import HttpCodes from '../helpers/HttpCodes';
import HTTPError from '../helpers/HTTPError';
const twoFactor = require('node-2fa');

class TwoFactorAuthService {

    private static _client: twilio.Twilio;

    /**
     * Send 2FA token to specified user by SMS
     * @param phoneNumber
     */
    public static async sendTokenViaSMS(phoneNumber: string): Promise<VerificationInstance> {
        return TwoFactorAuthService.client.verify.services(process.env.TWILIO_SERVICE_ID)
            .verifications
            .create({to: phoneNumber, channel: "sms"});
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

    private static get client(){
        if (!TwoFactorAuthService._client){
            TwoFactorAuthService._client = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
        return TwoFactorAuthService._client;
    }
}

export default TwoFactorAuthService;
