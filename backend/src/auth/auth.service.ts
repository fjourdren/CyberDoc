import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserHashService } from 'src/crypto/user-hash.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private userHashService: UserHashService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await this.isValidPassword(user, pass))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      (result as any).hash = this.userHashService.generateUserHash(email, pass);
      return result;
    }
    return null;
  }

  async isValidPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  generateJWTToken(
    userID: string,
    userHash: string,
    twoFactorAuthorized: boolean,
  ) {
    return this.jwtService.sign({ userID, userHash, twoFactorAuthorized });
  }

  decodeJwt(accessToken: string) {
    return this.jwtService.decode(accessToken, { complete: false, json: true });
  }

  sendJwtCookie(res: Response, accessToken: string) {
    const expirationDate = new Date();
    expirationDate.setSeconds(
      expirationDate.getSeconds() +
        this.configService.get<number>('JWT_EXPIRATION_TIME'),
    );

    res.cookie(this.configService.get<string>('JWT_COOKIE_NAME'), accessToken, {
      path: '/',
      httpOnly: true,
      expires: expirationDate,
      domain: this.configService.get<string>('JWT_COOKIE_DOMAIN'),
    });
  }

  async login(user: any) {
    const hasTwoFactoredEnabled =
      user._doc.twoFactorApp ||
      user._doc.twoFactorSms ||
      user._doc.twoFactorEmail;
    return {
      access_token: this.generateJWTToken(
        user._doc._id,
        user.hash,
        !hasTwoFactoredEnabled,
      ),
    };
  }
}
