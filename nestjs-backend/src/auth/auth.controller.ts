import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { Request } from "express";
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @SkipJWTAuth()
  @Post('login')
  async login(@Req() req: Request) {
    const { access_token } = await this.authService.login(req.user);
    return { msg: "Authentication token generated", access_token };
  }
}
