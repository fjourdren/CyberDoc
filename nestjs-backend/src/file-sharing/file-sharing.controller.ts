import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FilesService } from 'src/files/files.service';
import { LoggedUserHash } from 'src/auth/logged-user-hash.decorator';
import { LoggedUser } from 'src/auth/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { FileSharingService } from './file-sharing.service';
import { File } from 'src/schemas/file.schema';
import { CurrentFile, READ, OWNER } from 'src/files/current-file.decorator';
import { FileGuard } from 'src/files/file.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import {
  GetSharedFilesResponse,
  GetSharingAccessResponse,
} from './file-sharing.controller.types';
import { HttpStatusCode } from 'src/utils/http-status-code';

@ApiTags('file-sharing')
@ApiBearerAuth()
@Controller('files')
export class FileSharingController {
  constructor(
    private readonly filesService: FilesService,
    private readonly fileSharingService: FileSharingService,
  ) {}

  @Get('shared')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Get all files shared with the user',
    description: 'Get all files shared with the user',
  })
  @ApiOkResponse({ description: 'Success', type: GetSharedFilesResponse })
  async getSharedFiles(@LoggedUser() currentUser: User) {
    const sharedFiles = await this.fileSharingService.getSharedFiles(
      currentUser,
    );

    const results = await Promise.all(
      sharedFiles.map(async (value) => {
        return await this.filesService.prepareFileForOutput(value);
      }),
    );

    return { msg: 'Success', results };
  }

  @Get(':fileID/sharing')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'See for a file which users have sharing access to it',
    description: 'See for a file which users have sharing access to it',
  })
  @ApiOkResponse({ description: 'Success', type: GetSharingAccessResponse })
  async getSharingAccess(
    @LoggedUser() currentUser: User,
    @CurrentFile(READ) file: File,
  ) {
    if (
      currentUser._id !== file.owner_id &&
      !file.sharedWith.find((item) => item === currentUser._id)
    ) {
      throw new NotFoundException('File not found');
    }

    const {
      sharedUsers,
      sharedUsersPending,
    } = await this.fileSharingService.getSharingAccesses(file);
    return {
      msg: 'Success',
      shared_users: sharedUsers,
      shared_users_pending: sharedUsersPending,
    };
  }

  @Post(':fileID/sharing')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.CREATED)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiParam({
    name: 'email',
    description: 'User email',
    example: 'email@example.com',
  })
  @ApiOperation({
    summary: 'Add sharing access for a user and a file',
    description: 'Add sharing access for a user and a file',
  })
  @ApiCreatedResponse({ description: 'Success', type: GenericResponse })
  @ApiBadRequestResponse({
    description:
      'Cannot share a file with himself OR The email already have access to the file',
    type: GenericResponse,
  })
  async addSharingAccess(
    @LoggedUser() currentUser: User,
    @LoggedUserHash() currentUserHash: string,
    @CurrentFile(OWNER) file: File,
    @Body('email') email: string,
  ) {
    if (currentUser.email === email) {
      throw new BadRequestException('You cannot share a file with yourself');
    }

    await this.fileSharingService.addSharingAccess(
      currentUser,
      currentUserHash,
      email,
      file,
    );
    return { msg: 'Success' };
  }

  @Delete(':fileID/sharing/:email')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiParam({
    name: 'email',
    description: 'User email',
    example: 'email@example.com',
  })
  @ApiOperation({
    summary: 'Remove sharing access for a user and a file',
    description: 'Remove sharing access for a user and a file',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  @ApiBadRequestResponse({
    description:
      "Cannot share a file with himself OR The email don't have access to the file",
    type: GenericResponse,
  })
  async removeSharingAccess(
    @LoggedUser() currentUser: User,
    @CurrentFile(OWNER) file: File,
    @Param('email') email: string,
  ) {
    if (currentUser.email === email) {
      throw new BadRequestException('You cannot share a file with yourself');
    }

    await this.fileSharingService.removeSharingAccess(currentUser, email, file);
    return { msg: 'Success' };
  }
}
