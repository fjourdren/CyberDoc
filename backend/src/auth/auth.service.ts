import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserHashService } from 'src/crypto/user-hash.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { ConfigService } from '@nestjs/config';
import { UserDevice } from '../schemas/user-device.schema';
import { SHA3 } from 'sha3';
import { Session } from './auth.controller.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectRedis() private readonly redis: Redis,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userHashService: UserHashService,
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
    const indexKey = `tokens:${userId}:index`;
    const keys = await this.redis.smembers(indexKey);
    const sessions: Session[] = [];
    for (const rawValue of await this.redis.mget(keys)) {
      sessions.push(JSON.parse(rawValue));
    }
    return sessions;
  }

  async disableJWTToken(userId: string, hashedJWT: string) {
    const ttl = this.configService.get('JWT_EXPIRATION_TIME');
    const banKey = `banjwt_${hashedJWT}`;
    const jwtKey = `tokens:${userId}:${hashedJWT}`;
    const jwtIndexKey = `tokens:${userId}:index`;

    await this.redis
      .multi()
      .srem(jwtIndexKey, jwtKey)
      .del(jwtKey)
      .set(banKey, 'true')
      .expire(banKey, ttl)
      .exec();
  }

  generateJWTToken(
    userID: string,
    userHash: string,
    currentDeviceName: string,
  ) {
    return this.jwtService.sign({ userID, userHash, currentDeviceName });
  }

  async login(user: any, currentDevice: UserDevice, ip: string) {
    const accessToken = this.generateJWTToken(
      user._doc._id,
      user.hash,
      currentDevice.name,
    );

    const hashObj = new SHA3();
    hashObj.update(accessToken);
    const hashedJWT = hashObj.digest('hex');

    const key = `tokens:${user._doc._id}:${hashedJWT}`;
    const indexKey = `tokens:${user._doc._id}:index`;
    const data = {
      device: currentDevice,
      hashedJWT,
      ip,
      creationDate: new Date(),
    };
    const ttl = this.configService.get('JWT_EXPIRATION_TIME');

    await this.redis
      .multi()
      .set(key, JSON.stringify(data))
      .sadd(indexKey, key)
      .expire(key, ttl)
      .exec();

    return { access_token: accessToken };
  }
}
