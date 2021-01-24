import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserHashService } from 'src/crypto/user-hash.service';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
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

  generateJWTToken(
    userID: string,
    userHash: string,
    currentDeviceName: string,
  ) {
    return this.jwtService.sign({ userID, userHash, currentDeviceName });
  }

  async login(user: any, currentDeviceName: string) {
    return {
      access_token: this.generateJWTToken(
        user._doc._id,
        user.hash,
        currentDeviceName,
      ),
    };
  }
}
