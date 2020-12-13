import { Controller, Get, Request } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('profile')
  getProfile(@Request() req) {
    return { msg: "Success", user: req.user };
  }
}
