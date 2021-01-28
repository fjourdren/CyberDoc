import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { AuthService } from '../auth.service';
import { generateSecret, verifyToken } from 'node-2fa';
import { ConfigService } from '@nestjs/config';
import { TwoFactorType } from './two-factor-type.enum';

@Injectable()
export class TwoFactorAuthService {
  private readonly twilio;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.twilio = require('twilio')(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  async isAuthorized(accessToken: any): Promise<any> {
    return this.authService.decodeJwt(accessToken)['twoFactorAuthorized'];
  }

  isSpecific2FAIsEnabled(user: User, type: TwoFactorType) {
    switch (type) {
      case TwoFactorType.SMS:
        return user.twoFactorSms && user.phoneNumber != undefined;
      case TwoFactorType.APP:
        return user.twoFactorApp && user.secret != undefined;
      case TwoFactorType.EMAIL:
        return user.twoFactorEmail;
    }
  }

  async enableTwoFactorMethod(
    mongoSession: ClientSession,
    user: User,
    type: TwoFactorType,
  ) {
    switch (type) {
      case TwoFactorType.APP:
        user.twoFactorApp = true;
        break;
      case TwoFactorType.EMAIL:
        user.twoFactorEmail = true;
        break;
      case TwoFactorType.SMS:
        user.twoFactorSms = true;
        break;
    }
    return await new this.userModel(user).save({ session: mongoSession });
  }

  async disableTwoFactorMethod(
    mongoSession: ClientSession,
    user: User,
    type: TwoFactorType,
  ) {
    switch (type) {
      case TwoFactorType.APP:
        user.twoFactorApp = false;
        user.secret = null;
        break;
      case TwoFactorType.EMAIL:
        user.twoFactorEmail = false;
        break;
      case TwoFactorType.SMS:
        user.twoFactorSms = false;
        user.phoneNumber = null;
        break;
    }
    return await new this.userModel(user).save({ session: mongoSession });
  }

  async generateSecretForTwoFactorApp(mongoSession: ClientSession, user: User) {
    const generatedSecret = generateSecret({
      name: 'CyberDoc',
      account: user.email,
    });
    user.secret = generatedSecret.secret;
    await new this.userModel(user).save({ session: mongoSession });
    return generatedSecret;
  }

  async sendToken(type: TwoFactorType.EMAIL | TwoFactorType.SMS, user: User) {
    let to = type === TwoFactorType.EMAIL ? user.email : user.phoneNumber;
    await this.twilio.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to, channel: type });
  }

  async verifyToken(user: User, type: TwoFactorType, token: string) {
    if (type === TwoFactorType.APP) {
      const res = verifyToken(user.secret, token);
      if (!res)
        throw new ForbiddenException('Specified Two-Factor token is invalid.');
      if (res.delta !== 0)
        throw new ForbiddenException('Wrong token specified');
    } else {
      const res = await this.twilio.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({
          to: type === TwoFactorType.EMAIL ? user.email : user.phoneNumber,
          code: token,
        });
      if (!res.valid) throw new ForbiddenException('Wrong token specified');
    }
  }
}
