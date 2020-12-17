import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoggedUser } from 'src/auth/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { FilesTagsService } from './files-tags.service';
import { File } from 'src/schemas/file.schema';
import { CurrentFile, OWNER } from 'src/files/current-file.decorator';
import { FileGuard } from 'src/files/file.guard';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { MongoSession } from 'src/mongo-session.decorator';
import { ClientSession } from 'mongoose';

@ApiTags('file-tags')
@ApiBearerAuth()
@Controller('file-tags')
export class FilesTagsController {
  constructor(private readonly filesTagsService: FilesTagsService) {}

  @Post(':fileID')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Add a tag to a file',
    description: 'Add a tag to a file',
  })
  @ApiOkResponse({
    description: 'Tag added to the file',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({ description: 'Tag not found', type: GenericResponse })
  async addTag(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @CurrentFile(OWNER) file: File,
    @Body('tagId') tagID: string,
  ) {
    const tag = user.tags.find((tag) => tag._id === tagID);
    if (!file) throw new NotFoundException('Tag not found');

    if (file.tags.find((tag) => tag._id === tagID))
      throw new BadRequestException('File already have this tag');
    await this.filesTagsService.addTagToFile(mongoSession, file, tag);
    return { msg: 'Tag added to the file' };
  }

  @Delete(':fileID/:tagID')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiParam({
    name: 'tagID',
    description: 'Tag ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Remove a tag from a file',
    description: 'Remove a tag from a file',
  })
  @ApiOkResponse({
    description: 'Tag removed from file',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({ description: 'Tag not found', type: GenericResponse })
  async removeTag(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @CurrentFile(OWNER) file: File,
    @Param('tagID') tagID: string,
  ) {
    const tag = user.tags.find((tag) => tag._id === tagID);
    if (!file) throw new NotFoundException('Tag not found');
    await this.filesTagsService.removeTagFromFile(mongoSession, file, tag);
    return { msg: 'Tag removed from file' };
  }
}
