import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserHashService } from 'src/crypto/user-hash.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private userHashService: UserHashService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            (result as any).hash = this.userHashService.generateUserHash(username, pass); 
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            userID: user._doc._id,
            userHash: user.hash
        };
        
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}