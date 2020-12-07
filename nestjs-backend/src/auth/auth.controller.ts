import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @SkipJWTAuth()
    @Post('login')
    async login(@Request() req) {
      return this.authService.login(req.user);
    }
}
