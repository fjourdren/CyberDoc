import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserHashService } from 'src/crypto/user-hash.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserDevice } from '../schemas/user-device.schema';
import { SHA3 } from 'sha3';
import { Session } from './auth.controller.types';

export const REDIS_VALIDJWT_KEY = (userId: string, hashedJWT: string) =>
  `valid_tokens:${userId}:${hashedJWT}`;
export const REDIS_VALIDJWT_INDEX_KEY = (userId: string) =>
  `valid_tokens:${userId}:index`;
export const REDIS_BANJWT_KEY = (hashedJWT: string) =>
  `banned_tokens:${hashedJWT}`;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectRedis() private readonly redis: Redis,
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

  async getAllValidJwtTokensForUser(userId: string) {
    await this._cleanOutdatedTokens(userId);
    const keys = await this.redis.zrangebyscore(
      REDIS_VALIDJWT_INDEX_KEY(userId),
      '-inf',
      '+inf',
    );
    const sessions: Session[] = [];
    for (const rawValue of await this.redis.mget(keys)) {
      sessions.push(JSON.parse(rawValue));
    }
    return sessions;
  }

  async disableJWTToken(userId: string, hashedJWT: string) {
    const ttl = this.configService.get('JWT_EXPIRATION_TIME');
    await this.redis
      .multi()
      .zrem(
        REDIS_VALIDJWT_INDEX_KEY(userId),
        REDIS_VALIDJWT_KEY(userId, hashedJWT),
      )
      .del(REDIS_VALIDJWT_KEY(userId, hashedJWT))
      .setex(REDIS_BANJWT_KEY(hashedJWT), ttl, 'true')
      .exec();
  }

  generateJWTToken(
    userID: string,
    userHash: string,
    currentDeviceName: string,
    twoFactorAuthorized: boolean,
  ) {
    return this.jwtService.sign({
      userID,
      userHash,
      currentDeviceName,
      twoFactorAuthorized,
    });
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

  async login(user: any, currentDevice: UserDevice, ip: string) {
    const userId = user._doc._id;
    const hasTwoFactoredEnabled =
      user._doc.twoFactorApp ||
      user._doc.twoFactorSms ||
      user._doc.twoFactorEmail;
    const accessToken = this.generateJWTToken(
      userId,
      user.hash,
      currentDevice.name,
      !hasTwoFactoredEnabled,
    );

    const hashObj = new SHA3();
    hashObj.update(accessToken);
    const hashedJWT = hashObj.digest('hex');
    const data = {
      device: currentDevice,
      hashedJWT,
      ip,
      creationDate: new Date(),
    };

    const ttl = this.configService.get('JWT_EXPIRATION_TIME');
    const ttlDate = new Date();
    ttlDate.setSeconds(
      ttlDate.getSeconds() + this.configService.get('JWT_EXPIRATION_TIME'),
    );

    await this.redis
      .multi()
      .setex(REDIS_VALIDJWT_KEY(userId, hashedJWT), ttl, JSON.stringify(data))
      .zadd(
        REDIS_VALIDJWT_INDEX_KEY(userId),
        ttlDate.getTime(),
        REDIS_VALIDJWT_KEY(userId, hashedJWT),
      )
      .exec();

    return { access_token: accessToken };
  }

  //https://web.archive.org/web/20161007055137/https://quickleft.com/blog/how-to-create-and-expire-list-items-in-redis/
  private async _cleanOutdatedTokens(userId: string) {
    if ((await this.redis.exists(REDIS_VALIDJWT_INDEX_KEY(userId))) == 1) {
      await this.redis.zremrangebyscore(
        REDIS_VALIDJWT_INDEX_KEY(userId),
        0,
        Date.now(),
      );
    }
  }
}
