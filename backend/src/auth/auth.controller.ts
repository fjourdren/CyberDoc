import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiOkResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { Request, Response } from 'express';
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
      },
      required: ['username', 'password'],
    },
  })
  @ApiOperation({
    summary: 'Login',
    description: 'Login and store JWT token in a cookie',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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

  @Post('logout')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Logout',
    description: 'Disable JWT token',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  async logout(@Req() request: Request) {
    const jwt =
      request.cookies[this.configService.get<string>('JWT_COOKIE_NAME')];
    const key = 'ban_' + jwt;
    const ttl = this.configService.get('JWT_EXPIRATION_TIME');

    this.redis.multi().set(key, 'true').expire(key, ttl).exec();

    return { msg: 'Success' };
  }
}
