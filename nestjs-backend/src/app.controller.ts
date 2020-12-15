import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipJWTAuth } from './auth/jwt/skip-jwt-auth.annotation';
import { GetAPIInfoResponse } from './app.controller.types';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  @SkipJWTAuth()
  @ApiOperation({ summary: 'Get app info', description: 'Get app info' })
  @ApiOkResponse({ description: 'Success', type: GetAPIInfoResponse })
  getAPIInfo() {
    return {
      msg: 'Success',
      name: this.configService.get<string>('APP_NAME'),
      version: this.configService.get<string>('APP_VERSION'),
    };
  }
}
