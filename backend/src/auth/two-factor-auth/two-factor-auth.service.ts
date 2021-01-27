import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { AuthService } from '../auth.service';
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
  logger;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly authService: AuthService,
  ) {
    this.logger = new Logger(TwoFactorAuthService.name);
  }

  async isAuthorized(accessToken: any): Promise<any> {
    return this.authService.decodeJwt(accessToken)['twoFactorAuthorized'];
  }

  async enable(
    mongoSession: ClientSession,
    email: string,
    type: 'sms' | 'app' | 'email',
    phone_number: string,
  ): Promise<any> {
    const user = await this.userModel.findOne({ email });
    switch (type) {
      case 'app':
        user.twoFactorApp = true;
        break;
      case 'email':
        user.twoFactorEmail = true;
        break;
      case 'sms':
        user.twoFactorSms = true;
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
        user.twoFactorApp = false;
        user.secret = null;
        break;
      case 'email':
        user.twoFactorEmail = false;
        break;
      case 'sms':
        user.twoFactorSms = false;
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
    sendingWay: 'email' | 'sms',
    emailOrPhoneNumber: string,
  ): Promise<any> {
    return twilio.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to: emailOrPhoneNumber, channel: sendingWay });
  }

  async verifyTokenByEmailOrSms(
    user: any,
    sendingWay: 'email' | 'sms',
    token: string,
  ): Promise<any> {
    return twilio.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: sendingWay === 'email' ? user.email : user.phoneNumber,
        code: token,
      })
      .then((res) => {
        return res;
      });
  }

  async verifyTokenGeneratedByApp(user: any, token: string): Promise<any> {
    const res = twoFactor.verifyToken(user.secret, token);
    if (!res) {
      throw new ForbiddenException('Specified Two-Factor token is invalid.');
    }
    return res.delta;
  }
}
