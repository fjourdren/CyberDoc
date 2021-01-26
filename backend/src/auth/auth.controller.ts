import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
  Body,
  BadRequestException,
  Get,
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
import { CurrentDevice } from '../users/current-device.decorator';
import { UserDevice } from '../schemas/user-device.schema';
import { SHA3 } from 'sha3';
import { LoggedUser } from './logged-user.decorator';
import { User } from '../schemas/user.schema';
import { GetActiveSessionsResponse } from './auth.controller.types';
import { TerminateSessionDto } from './dto/terminate-session.dto';

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
        currentDeviceName: {
          type: 'string',
          description: 'Current device name',
          example: 'MyComputer',
        },
      },
      required: ['username', 'password', 'currentDeviceName'],
    },
  })
  @ApiOperation({
    summary: 'Login',
    description: 'Login and store JWT token in a cookie',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  async login(
    @Req() req: Request,
    @CurrentDevice() currentDevice: UserDevice,
    @Body('currentDeviceName') currentDeviceName: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!currentDeviceName || currentDeviceName.length === 0) {
      throw new BadRequestException('Missing currentDeviceName');
    }
    currentDevice.name = currentDeviceName;
    const ip =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const { access_token } = await this.authService.login(
      req.user,
      currentDevice,
      ip,
    );
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
  async logout(@Req() request: Request, @LoggedUser() user: User) {
    const jwt =
      request.cookies[this.configService.get<string>('JWT_COOKIE_NAME')];

    const hashObj = new SHA3();
    hashObj.update(jwt);
    const hashedJWT = hashObj.digest('hex');

    await this.authService.disableJWTToken(user._id, hashedJWT);
    return { msg: 'Success' };
  }

  @Get('active-sessions')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Get active sessions',
    description: 'Get active sessions',
  })
  @ApiOkResponse({ description: 'Success', type: GetActiveSessionsResponse })
  async getActiveSessions(@LoggedUser() user: User) {
    const sessions = await this.authService.getAllValidJwtTokensForUser(
      user._id,
    );
    return { msg: 'Success', sessions };
  }

  @Post('terminate-session')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Terminate a session',
    description: 'Terminate a session',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  async terminateSession(
    @LoggedUser() user: User,
    @Body() dto: TerminateSessionDto,
  ) {
    await this.authService.disableJWTToken(user._id, dto.hashedJWT);
    return { msg: 'Success' };
  }
}
