import { Body, Controller, Delete, Get, HttpCode, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from 'src/auth/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { GetProfileResponse } from './users.controller.types';
import { UsersService } from './users.service';
import { Response } from "express";
import { GenericResponse } from 'src/generic-response.interceptor';
import { LoggedUserHash } from 'src/auth/logged-user-hash.decorator';
import { EditUserDto } from './dto/edit-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';

@ApiTags("users")
@ApiBearerAuth()
@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService
  ) { }

  @Post()
  @SkipJWTAuth()
  @HttpCode(HttpStatusCode.CREATED)
  @ApiOperation({ summary: "Create a new user", description: "Create a new user" })
  @ApiCreatedResponse({ description: "Success", type: GenericResponse })
  @ApiConflictResponse({ description: "Another user with the same email already exists", type: GenericResponse })
  async createProfile(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
    return { msg: "Success" };
  }

  @Get('profile')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({ summary: "Get current user", description: "Get current user" })
  @ApiOkResponse({ description: "Success", type: GetProfileResponse })
  async getProfile(@LoggedUser() user: User) {
    return { msg: "Success", user: await this.usersService.prepareUserForOutput(user) };
  }

  @Post('profile')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({ summary: "Edit current user", description: "Edit current user" })
  @ApiOkResponse({ description: "Success", type: GenericResponse })
  async setProfile(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Body() editUserDto: EditUserDto) {
    //TODO x-auth-token
    user = await this.usersService.editUserBasicMetadata(user, editUserDto.firstname, editUserDto.lastname);
    user = await this.usersService.editUserEmailAndPassword(user, userHash, editUserDto.email, editUserDto.password);
    return { msg: "Success" };
  }

  @Delete('profile')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({ summary: "Delete current user", description: "Delete current user" })
  @ApiOkResponse({ description: "Success", type: GenericResponse })
  async deleteProfile(@LoggedUser() user: User) {
    //TODO x-auth-token
    await this.usersService.deleteUser(user);
    return { msg: "Success" };
  }

  @Get('exportData')
  @HttpCode(HttpStatusCode.OK)
  @ApiProduces("text/plain")
  @ApiOperation({ summary: "Export user data (without file content)", description: "Export user data (without file content)" })
  @ApiOkResponse({ description: "Done" })
  async exportData(@LoggedUser() user: User, @Res() res: Response) {
    const data = JSON.stringify(await this.usersService.exportData(user));
    res.set('Content-Type', "text/plain");
    res.set('Content-Disposition', `attachment; filename="${user.email}-personal-data.txt"`);
    res.send(Buffer.from(data, "utf-8"));
  }

}
