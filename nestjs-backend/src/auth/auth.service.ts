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
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      (result as any).hash = this.userHashService.generateUserHash(email, pass);
      return result;
    }
    return null;
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  generateJWTToken(userID: string, userHash: string) {
    return this.jwtService.sign({ userID, userHash });
  }

  async login(user: any) {
    return {
      access_token: this.generateJWTToken(user._doc._id, user.hash),
    };
  }
}
