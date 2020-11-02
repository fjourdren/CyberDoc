import * as twilio from 'twilio';
import {VerificationInstance} from "twilio/lib/rest/verify/v2/service/verification";
import {VerificationCheckInstance} from "twilio/lib/rest/verify/v2/service/verificationCheck";
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

    private static get client(){
        if (!TwoFactorAuthService._client){
            TwoFactorAuthService._client = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
        return TwoFactorAuthService._client;
    }
}

export default TwoFactorAuthService;