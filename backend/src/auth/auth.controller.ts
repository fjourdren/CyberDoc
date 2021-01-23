import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local-auth.guard';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @SkipJWTAuth()
  @Post('login')
  @HttpCode(HttpStatusCode.OK)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          description: 'Password',
          example: 'eV66scN@t5tGG%ND',
        },
        twoFactorToken: {
          type: 'string',
          description: 'Two-Factor Authentication token',
          example: '123456',
        },
      },
      required: ['username', 'password'],
    },
  })
  @ApiOperation({
    summary: 'Login',
    description: 'Login and store JWT token in a cookie',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  async login(
    @Req() req: Request,
    @Body('twoFactorToken') twoFactorToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req.user as any)._doc;
    if (
      user.twoFactorByApp === true ||
      user.twoFactorByEmail === true ||
      user.twoFactorBySms === true
    ) {
      if (!twoFactorToken) {
        throw new BadRequestException('Two-Factor token is required.');
      } else {
        if (!(twoFactorToken as string).match('[0-9]{6}')) {
          throw new BadRequestException(
            'Two-Factor token must be a 6 digits number.',
          );
        }
      }

      if (user.twoFactorByApp === true) {
        await this.twoFactorAuthService
          .verifyTokenGeneratedByApp(user.secret, twoFactorToken)
          .then((res) => {
            if (res !== 0) {
              throw new UnauthorizedException(
                'Specified Two-Factor token is invalid.',
              );
            }
          });
      } else if (user.twoFactorByEmail === true) {
        await this.twoFactorAuthService
          .sendToken('email', user.email)
          .then(() => {
            this.twoFactorAuthService
              .verifyTokenByEmailOrSms('email', twoFactorToken)
              .then((res) => {
                if (res !== 0) {
                  throw new UnauthorizedException(
                    'Specified Two-Factor token is invalid.',
                  );
                }
              });
          });
      } else if (user.twoFactorBySms === true) {
        await this.twoFactorAuthService
          .sendToken('sms', user.phoneNumber)
          .then(() => {
            this.twoFactorAuthService
              .verifyTokenByEmailOrSms('sms', twoFactorToken)
              .then((res) => {
                if (res !== 0) {
                  throw new UnauthorizedException(
                    'Specified Two-Factor token is invalid.',
                  );
                }
              });
          });
      }
    }

    const { access_token } = await this.authService.login(req.user);
    const expirationDate = new Date();
    expirationDate.setSeconds(
      expirationDate.getSeconds() +
        this.configService.get<number>('JWT_EXPIRATION_TIME'),
    );

    res.cookie(
      this.configService.get<string>('JWT_COOKIE_NAME'),
      access_token,
      {
        path: '/',
        httpOnly: true,
        expires: expirationDate,
        domain: this.configService.get<string>('JWT_COOKIE_DOMAIN'),
      },
    );
    return { msg: 'Success' };
  }
}
