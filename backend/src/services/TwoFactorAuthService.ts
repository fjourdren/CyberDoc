import * as twilio from 'twilio';
import {VerificationInstance} from "twilio/lib/rest/verify/v2/service/verification";
import {VerificationCheckInstance} from "twilio/lib/rest/verify/v2/service/verificationCheck";

require('dotenv').config()
const twoFactor = require('node-2fa');
const client = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class TwoFactorAuthService {
    /**
     * Send 2FA token to specified user by EMAIL or SMS
     * @param sendingWay
     * @param emailOrPhoneNumber
     */
    public static async sendToken(sendingWay: string, emailOrPhoneNumber: string): Promise<VerificationInstance> {
        return client.verify.services(process.env.TWILIO_SERVICE_ID)
            .verifications
            .create({to: emailOrPhoneNumber, channel: sendingWay});
    }

    /**
     * Verify that the provided token is correct
     * @param emailOrPhoneNumber
     * @param token
     */
    public static async verifyTokenByEmailOrSms(emailOrPhoneNumber: string, token: string): Promise<VerificationCheckInstance> {
        return TwoFactorAuthService.generateClient().verify.services(process.env.TWILIO_SERVICE_ID)
            .verificationChecks
            .create({to: emailOrPhoneNumber, code: token}).then(res => {
                return res;
            });
    }

    public static async generateSecretByEmail(email: string): Promise<any> {
        return twoFactor.generateSecret({name: 'CyberDoc', account: email});
    }

    public static async verifyTokenGeneratedByApp(secret: string, token: string): Promise<number> {
        return twoFactor.verifyToken(secret, token);
    }

    private static generateClient() {
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        return new twilio.Twilio(twilioAccountSid, twilioAuthToken);
    }
}

export default TwoFactorAuthService;