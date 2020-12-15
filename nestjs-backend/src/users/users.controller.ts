import { Controller, Get, HttpCode, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import { LoggedUser } from 'src/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { GetProfileResponse } from './users.controller.types';
import { UsersService } from './users.service';

@ApiTags("users")
@ApiBearerAuth()
@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService
  ) { }

  @Get('profile')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({ summary: "Get current user", description: "Get current user" })
  @ApiOkResponse({ description: "Done", type: GetProfileResponse })
  async getProfile(@LoggedUser() user: User) {
    return { msg: "Success", user: await this.usersService.prepareUserForOutput(user) };
  }
}
