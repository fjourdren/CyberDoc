import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HttpStatusCode } from '../../utils/http-status-code';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponse } from '../../generic-response.interceptor';
import { MongoSession } from '../../mongo-session.decorator';
import { ClientSession } from 'mongoose';
import { LoggedUser } from '../logged-user.decorator';
import { User } from '../../schemas/user.schema';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { SkipJWTAuth } from '../jwt/skip-jwt-auth.annotation';
import { LocalAuthGuard } from '../local/local-auth.guard';
import { LoggedUserHash } from '../logged-user-hash.decorator';

@ApiTags('two-factor-auth')
@ApiBearerAuth()
@Controller('two-factor-auth')
export class TwoFactorAuthController {
  logger;

  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.logger = new Logger(TwoFactorAuthController.name);
  }

  @Get('isAuthorized')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Verify if 2FA is verified',
    description: 'Verify if 2FA is verified',
  })
  @ApiOkResponse({
    description: 'You are two-factor authorized',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: 'You are not two-factor authorized',
    type: GenericResponse,
  })
  async isTwoFactorAuthorized(@Req() req: Request, @LoggedUser() user: User) {
    const accessToken =
      req?.cookies[this.configService.get<string>('JWT_COOKIE_NAME')];
    if (!accessToken) {
      throw new BadRequestException('No access_token defined');
    }
    const isAuthorized = await this.twoFactorAuthService.isAuthorized(
      accessToken,
    );
    if (
      !isAuthorized &&
      (user.twoFactorSms || user.twoFactorEmail || user.twoFactorApp)
    ) {
      throw new UnauthorizedException('You are not two-factor authorized');
    }
    return { msg: 'Success' };
  }

  @Post('enable')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'email',
    description: 'Email address',
    example: 'john.doe@email.com',
  })
  @ApiParam({
    name: 'type',
    description: 'Two-Factor type to enable',
    example: 'app',
  })
  @ApiParam({
    name: 'twoFactorToken',
    description:
      'Two-Factor token generated/received (depends on the specified type)',
    example: '123456',
  })
  @ApiOperation({
    summary: 'Enable two-factor authentication',
    description: 'Enable two-factor authentication',
  })
  @ApiOkResponse({
    description: 'Two-factor authentication enabled',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: 'Two-factor authentication not enabled',
    type: GenericResponse,
  })
  async enableTwoFactor(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @Body('type') type: string,
    @Body('twoFactorToken') twoFactorToken: string,
  ) {
    if (!type) {
      throw new BadRequestException('Two-Factor type is required.');
    } else if (type !== 'app' && type !== 'email' && type !== 'sms') {
      throw new BadRequestException("Specified Two-Factor type doesn't exist.");
    }

    if (type === 'app') {
      if (user.twoFactorApp) {
        throw new BadRequestException(
          'Two-factor authentication by App is already enabled.',
        );
      } else {
        if (!user.secret) {
          throw new ForbiddenException('User secret not defined.');
        }
        await this.twoFactorAuthService
          .verifyTokenGeneratedByApp(user, twoFactorToken)
          .then((res) => {
            if (res !== 0) {
              throw new ForbiddenException('Wrong token specified');
            }
          });
      }
    } else if (type === 'sms') {
      if (user.twoFactorSms) {
        throw new BadRequestException(
          'Two-factor authentication by Sms is already enabled.',
        );
      } else {
        if (!user.phoneNumber) {
          throw new ForbiddenException('User phone number not defined.');
        }
        await this.twoFactorAuthService
          .verifyTokenByEmailOrSms(user, 'sms', twoFactorToken)
          .then((res) => {
            if (!res.valid) {
              throw new ForbiddenException('Wrong token specified');
            }
          });
      }
    } else if (type === 'email') {
      if (user.twoFactorEmail) {
        throw new BadRequestException(
          'Two-factor authentication by Email is already enabled.',
        );
      } else {
        await this.twoFactorAuthService
          .verifyTokenByEmailOrSms(user, 'email', twoFactorToken)
          .then((res) => {
            if (!res.valid) {
              throw new ForbiddenException('Wrong token specified');
            }
          });
      }
    }
    return await this.twoFactorAuthService.enable(
      mongoSession,
      user.email,
      type,
      user.phoneNumber,
    );
  }

  @Post('disable')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'email',
    description: 'Email address',
    example: 'john.doe@email.com',
  })
  @ApiParam({
    name: 'type',
    description: 'Two-Factor type to disable',
    example: 'app',
  })
  @ApiParam({
    name: 'twoFactorToken',
    description:
      'Two-Factor token generated/received (depends on the specified type)',
    example: '123456',
  })
  @ApiOperation({
    summary: 'Disable two-factor authentication',
    description: 'Disable two-factor authentication',
  })
  @ApiOkResponse({
    description: 'Two-factor authentication disabled',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: 'Two-factor authentication not disabled',
    type: GenericResponse,
  })
  async disableTwoFactor(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @Body('type') type: string,
  ) {
    if (!type) {
      throw new BadRequestException('Two-Factor type is required.');
    } else if (type !== 'app' && type !== 'email' && type !== 'sms') {
      throw new BadRequestException("Specified Two-Factor type doesn't exist.");
    }
    if (!user.twoFactorApp && type === 'app') {
      throw new BadRequestException(
        'Two-factor authentication by App is already disabled.',
      );
    } else if (!user.twoFactorSms && type === 'sms') {
      throw new BadRequestException(
        'Two-factor authentication by Sms is already disabled.',
      );
    } else if (!user.twoFactorEmail && type === 'email') {
      throw new BadRequestException(
        'Two-factor authentication by Email is already disabled.',
      );
    }
    // await this.verifyToken(user, type, twoFactorToken);
    return await this.twoFactorAuthService.disable(
      mongoSession,
      user.email,
      type,
    );
  }

  @Get('generateSecret')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Generates a secret for Two-Factor Auth by App',
    description: 'Generates a secret for Two-Factor Auth by App',
  })
  @ApiOkResponse({
    description: 'Secret generated',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: 'Secret not generated',
    type: GenericResponse,
  })
  async generateSecret(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
  ) {
    return {
      msg: await this.twoFactorAuthService.generateSecretByEmail(
        mongoSession,
        user.email,
      ),
    };
  }

  @Post('sendToken')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'type',
    description: 'By SMS or email',
    example: 'app',
  })
  @ApiOperation({
    summary: 'Sends an OTP by the specified sending way',
    description: 'Sends an OTP by the specified sending way',
  })
  @ApiOkResponse({
    description: 'Token has been sent',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: "Token hasn't been sent",
    type: GenericResponse,
  })
  async sendToken(@Body('type') type: string, @LoggedUser() user: User) {
    if (!type) {
      throw new BadRequestException('Sending way must be defined.');
    } else if (type !== 'email' && type !== 'sms') {
      throw new BadRequestException(
        'Specified sending way is incorrect. Must be email or sms.',
      );
    }
    if (type === 'sms' && !user.phoneNumber) {
      throw new ForbiddenException('Phone number is not defined.');
    }
    return {
      msg: await this.twoFactorAuthService.sendToken(
        type,
        type === 'email' ? user.email : user.phoneNumber,
      ),
    };
  }

  @Post('verifyToken')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'type',
    description: 'Two-Factor type',
    example: 'email',
  })
  @ApiParam({
    name: 'twoFactorToken',
    description: 'Two-factor token',
    example: '123456',
  })
  @ApiOperation({
    summary: 'Verify that token is correct',
    description: 'Verify that token is correct',
  })
  @ApiOkResponse({
    description: 'Valid token',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: 'Invalid token',
    type: GenericResponse,
  })
  async verifyToken(
    @Res({ passthrough: true }) res: Response,
    @LoggedUserHash() userHash: string,
    @LoggedUser() user: User,
    @Body('type') type: string,
    @Body('twoFactorToken') twoFactorToken: string,
  ) {
    if (!twoFactorToken) {
      throw new BadRequestException('Two-Factor token is required.');
    } else {
      if (!twoFactorToken.match('[0-9]{6}')) {
        throw new BadRequestException(
          'Two-Factor token must be a 6 digits number.',
        );
      }
    }
    let retour;
    switch (type) {
      case 'app':
        retour = await this.twoFactorAuthService.verifyTokenGeneratedByApp(
          user,
          twoFactorToken,
        );
        if (retour !== 0) {
          throw new ForbiddenException(
            'Specified Two-Factor token is invalid.',
          );
        }
        break;
      case 'sms':
      case 'email':
        try {
          retour = await this.twoFactorAuthService.verifyTokenByEmailOrSms(
            user,
            type,
            twoFactorToken,
          );
        } catch (e) {
          throw new ForbiddenException(
            'Specified Two-Factor token is invalid.',
          );
        }
        if (!retour.valid) {
          throw new ForbiddenException(
            'Specified Two-Factor token is invalid.',
          );
        }
        break;
    }
    const access_token = this.authService.generateJWTToken(
      user._id,
      userHash,
      true,
    );
    this.authService.sendJwtCookie(res, access_token);
    return {
      msg: 'Success',
    };
  }
}
