import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local-auth.guard';
import { LoggedUser } from './logged-user.decorator';
import { User } from '../schemas/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    this.authService.sendJwtCookie(res, access_token);
    return { msg: 'Success' };
  }

  @Post('validatepassword')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'password',
    description: 'Password to check',
    example: '123456',
  })
  @ApiOperation({
    summary: 'Check if specified password is valid',
    description: 'Check if specified password is valid',
  })
  @ApiOkResponse({
    description: 'Valid password',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: 'Password is incorrect',
    type: GenericResponse,
  })
  async validatePassword(
    @LoggedUser() user: User,
    @Body('password') password: string,
  ) {
    if (!(await this.authService.isValidPassword(user, password)))
      throw new ForbiddenException('Specified password is incorrect');
    return { msg: 'Success' };
  }
}
