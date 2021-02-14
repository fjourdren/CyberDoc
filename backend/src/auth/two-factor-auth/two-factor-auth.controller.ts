import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpStatusCode } from '../../utils/http-status-code';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponse } from '../../generic-response.interceptor';
import { MongoSession } from '../../mongo-session.decorator';
import { ClientSession } from 'mongoose';
import { LoggedUser } from '../logged-user.decorator';
import { User } from '../../schemas/user.schema';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { LoggedUserHash } from '../logged-user-hash.decorator';
import { TwoFactorTypeAndTokenDto } from '../dto/two-factor-type-and-token.dto';
import { TwoFactorType } from './two-factor-type.enum';
import { SendTokenDto } from '../dto/send-token.dto';
import { IsTwoFactorAuthorized } from '../is-two-factor-authorized';
import { TwoFactorTypeDto } from '../dto/two-factor-type.dto';
import { TwoFactorRecoveryCodeDto } from '../dto/two-factor-recovery-code.dto';
import { CurrentDevice } from '../../users/current-device.decorator';
import { UserDevice } from '../../schemas/user-device.schema';

@ApiTags('two-factor-auth')
@ApiBearerAuth()
@Controller('two-factor-auth')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post('enable')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Enable two-factor authentication',
    description: 'Enable two-factor authentication',
  })
  @ApiOkResponse({
    description: 'Two-factor authentication enabled',
    type: GenericResponse,
  })
  async enableTwoFactor(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @Body() dto: TwoFactorTypeAndTokenDto,
  ) {
    if (this.twoFactorAuthService.isSpecific2FAIsEnabled(user, dto.type)) {
      throw new BadRequestException(
        `Two-factor authentication by ${dto.type} is already enabled.`,
      );
    }

    if (dto.type === TwoFactorType.SMS && !user.phoneNumber) {
      throw new BadRequestException('User phone number not defined.');
    } else if (dto.type === TwoFactorType.APP && !user.secret) {
      throw new BadRequestException('User secret not defined.');
    }

    await this.twoFactorAuthService.verifyToken(
      user,
      dto.type,
      dto.twoFactorToken,
    );
    await this.twoFactorAuthService.enableTwoFactorMethod(
      mongoSession,
      user,
      dto.type,
    );
    return { msg: `Two-Factor by ${dto.type} has been enabled.` };
  }

  @Post('disable')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Disable two-factor authentication',
    description: 'Disable two-factor authentication',
  })
  @ApiOkResponse({
    description: 'Two-factor authentication disabled',
    type: GenericResponse,
  })
  async disableTwoFactor(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @Body() dto: TwoFactorTypeDto,
  ) {
    if (!this.twoFactorAuthService.isSpecific2FAIsEnabled(user, dto.type)) {
      throw new BadRequestException(
        `Two-factor authentication by ${dto.type} is already disabled.`,
      );
    }

    // await this.twoFactorAuthService.verifyToken(
    //   user,
    //   dto.type,
    //   dto.twoFactorToken,
    // );
    await this.twoFactorAuthService.disableTwoFactorMethod(
      mongoSession,
      user,
      dto.type,
    );
    return { msg: `Two-Factor by ${dto.type} has been disabled.` };
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
  async generateSecret(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
  ) {
    return {
      msg: await this.twoFactorAuthService.generateSecretForTwoFactorApp(
        mongoSession,
        user,
      ),
    };
  }

  @Post('sendToken')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Sends an OTP by the specified sending way',
    description: 'Sends an OTP by the specified sending way',
  })
  @ApiOkResponse({
    description: 'Token has been sent',
    type: GenericResponse,
  })
  async sendToken(@LoggedUser() user: User, @Body() dto: SendTokenDto) {
    if (dto.type === TwoFactorType.APP) {
      throw new BadRequestException('Cannot use this endpoint with app 2FA');
    }
    return { msg: await this.twoFactorAuthService.sendToken(dto.type, user) };
  }

  @Post('verifyToken')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Verify that token is correct',
    description: 'Verify that token is correct',
  })
  @ApiOkResponse({
    description: 'Valid token',
    type: GenericResponse,
  })
  async verifyToken(
    @Res({ passthrough: true }) res: Response,
    @LoggedUserHash() userHash: string,
    @LoggedUser() user: User,
    @CurrentDevice() currentDevice: UserDevice,
    @Body() dto: TwoFactorTypeAndTokenDto,
  ) {
    await this.twoFactorAuthService.verifyToken(
      user,
      dto.type,
      dto.twoFactorToken,
    );
    const access_token = this.authService.generateJWTToken(
      user._id,
      userHash,
      currentDevice.name,
      true,
    );
    this.authService.sendJwtCookie(res, access_token);
    return {
      msg: 'Success',
    };
  }

  @Get('generateRecoveryCodes')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Generates recovery codes for Two-Factor',
    description: 'Generates recovery codes for Two-Factor',
  })
  @ApiOkResponse({
    description: 'Recovery codes generated',
    type: GenericResponse,
  })
  async generateRecoveryCodes(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
  ) {
    if (!user.twoFactorApp && !user.twoFactorEmail && !user.twoFactorSms) {
      throw new UnauthorizedException(
        'You must have at least 1 Two-Factor option enabled.',
      );
    }
    return {
      msg: await this.twoFactorAuthService.generateRecoveryCodes(
        mongoSession,
        user,
      ),
    };
  }

  @Post('useRecoveryCode')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Consumes recovery code for Two-Factor',
    description: 'Consumes recovery code for Two-Factor',
  })
  @ApiOkResponse({
    description: 'Recovery code used',
    type: GenericResponse,
  })
  async useRecoveryCode(
    @Res({ passthrough: true }) res: Response,
    @LoggedUserHash() userHash: string,
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @CurrentDevice() currentDevice: UserDevice,
    @Body() dto: TwoFactorRecoveryCodeDto,
  ) {
    if (!user.twoFactorRecoveryCodes) {
      throw new UnauthorizedException(
        'You must have generated recovery codes before using one.',
      );
    }
    const codeToUse = user.twoFactorRecoveryCodes.find(
      (twoFactorRecoveryCode) =>
        twoFactorRecoveryCode.code === dto.twoFactorRecoveryCode,
    );
    if (!codeToUse || !codeToUse.isValid) {
      throw new ForbiddenException('This recovery code is invalid');
    }

    const hasRecoveryCodesLeft = await this.twoFactorAuthService.useRecoveryCode(
      mongoSession,
      user,
      dto.twoFactorRecoveryCode,
    );

    const access_token = this.authService.generateJWTToken(
      user._id,
      userHash,
      currentDevice.name,
      true,
    );
    this.authService.sendJwtCookie(res, access_token);
    return {
      msg: { hasRecoveryCodesLeft },
    };
  }
}
