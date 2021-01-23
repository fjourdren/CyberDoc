import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twoFactor = require('node-2fa');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

@Injectable()
export class TwoFactorAuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async enable(
    mongoSession: ClientSession,
    email: string,
    type: 'sms' | 'app' | 'email',
    phone_number: string,
  ): Promise<any> {
    const user = await this.userModel.findOne({ email });
    switch (type) {
      case 'app':
        user.twoFactorByApp = true;
        break;
      case 'email':
        user.twoFactorByEmail = true;
        break;
      case 'sms':
        user.twoFactorBySms = true;
        user.phoneNumber = phone_number;
        break;
    }
    await new this.userModel(user).save({ session: mongoSession });
    return { msg: 'Two-Factor by ' + type + ' has been enabled.' };
  }

  async disable(
    mongoSession: ClientSession,
    email: string,
    type: 'sms' | 'app' | 'email',
  ): Promise<any> {
    const user = await this.userModel.findOne({ email });
    switch (type) {
      case 'app':
        user.twoFactorByApp = false;
        user.secret = null;
        break;
      case 'email':
        user.twoFactorByEmail = false;
        break;
      case 'sms':
        user.twoFactorBySms = false;
        user.phoneNumber = null;
        break;
    }
    await new this.userModel(user).save({ session: mongoSession });
    return { msg: 'Two-Factor by ' + type + ' has been disabled.' };
  }

  async generateSecretByEmail(
    mongoSession: ClientSession,
    email: string,
  ): Promise<any> {
    const user = await this.userModel.findOne({ email });
    const generatedSecret = twoFactor.generateSecret({
      name: 'CyberDoc',
      account: email,
    });
    user.secret = generatedSecret.secret;
    await new this.userModel(user).save({ session: mongoSession });
    return generatedSecret;
  }

  async sendToken(
    sendingWay: string,
    emailOrPhoneNumber: string,
  ): Promise<any> {
    return twilio.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to: emailOrPhoneNumber, channel: sendingWay });
  }

  async verifyTokenByEmailOrSms(
    emailOrPhoneNumber: string,
    token: string,
  ): Promise<any> {
    return TwoFactorAuthService.generateClient()
      .verify.services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to: emailOrPhoneNumber, code: token })
      .then((res) => {
        return res;
      });
  }

  async verifyTokenGeneratedByApp(secret: string, token: string): Promise<any> {
    const res = twoFactor.verifyToken(secret, token);
    if (!res) {
      throw new UnauthorizedException('Specified Two-Factor token is invalid.');
    }
    return res.delta;
  }

  public static generateClient() {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    return new twilio.Twilio(twilioAccountSid, twilioAuthToken);
  }
}
