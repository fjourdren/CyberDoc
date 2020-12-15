import { Controller, Post, UseGuards, Req, Body, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from "express";
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @UseGuards(LocalAuthGuard)
  @SkipJWTAuth()
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(req.user);
    res.cookie(this.configService.get<string>("JWT_COOKIE_NAME"), access_token, {
      path: '/',
      httpOnly: true,
      domain: this.configService.get<string>("JWT_COOKIE_DOMAIN"),
    });
    return { msg: "Success" };
  }
}
