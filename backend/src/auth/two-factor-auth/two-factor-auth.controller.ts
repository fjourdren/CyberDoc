import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  Post,
  UnauthorizedException,
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

@ApiTags('two-factor-auth')
@ApiBearerAuth()
@Controller('two-factor-auth')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

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

    if (!twoFactorToken) {
      throw new BadRequestException('Two-Factor token is required.');
    } else {
      if (!twoFactorToken.match('[0-9]{6}')) {
        throw new BadRequestException(
          'Two-Factor token must be a 6 digits number.',
        );
      }
    }

    if (type === 'app') {
      if (user.twoFactorByApp) {
        throw new BadRequestException(
          'Two-factor authentication by App is already enabled.',
        );
      } else {
        if (!user.secret) {
          throw new ForbiddenException('User secret not defined.');
        }
        await this.twoFactorAuthService
          .verifyTokenGeneratedByApp(user.secret, twoFactorToken)
          .then((res) => {
            if (res !== 0) {
              throw new UnauthorizedException('Wrong token specified');
            }
          });
      }
    } else if (type === 'sms') {
      if (user.twoFactorBySms) {
        throw new BadRequestException(
          'Two-factor authentication by Sms is already enabled.',
        );
      } else {
        if (!user.phoneNumber) {
          throw new ForbiddenException('User phone number not defined.');
        }
        await this.twoFactorAuthService
          .verifyTokenByEmailOrSms(user.phoneNumber, twoFactorToken)
          .then((res) => {
            if (res !== 0) {
              throw new UnauthorizedException('Wrong token specified');
            }
          });
      }
    } else if (type === 'email') {
      if (user.twoFactorByEmail) {
        throw new BadRequestException(
          'Two-factor authentication by Email is already enabled.',
        );
      } else {
        await this.twoFactorAuthService
          .verifyTokenByEmailOrSms(user.email, twoFactorToken)
          .then((res) => {
            if (res !== 0) {
              throw new UnauthorizedException('Wrong token specified');
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
    if (!user.twoFactorByApp && type === 'app') {
      throw new BadRequestException(
        'Two-factor authentication by App is already disabled.',
      );
    } else if (!user.twoFactorBySms && type === 'sms') {
      throw new BadRequestException(
        'Two-factor authentication by Sms is already disabled.',
      );
    } else if (!user.twoFactorByEmail && type === 'email') {
      throw new BadRequestException(
        'Two-factor authentication by Email is already disabled.',
      );
    }
    return await this.twoFactorAuthService.disable(
      mongoSession,
      user.email,
      type,
    );
  }

  @Get('generateSecret')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'email',
    description: 'Email address',
    example: 'john.doe@email.com',
  })
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

  @Post('verifyToken')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'email',
    description: 'Email address',
    example: 'john.doe@email.com',
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
    let msg;
    switch (type) {
      case 'app':
        msg = await this.twoFactorAuthService.verifyTokenGeneratedByApp(
          user.secret,
          twoFactorToken,
        );
        break;
    }
    return msg;
  }
}
