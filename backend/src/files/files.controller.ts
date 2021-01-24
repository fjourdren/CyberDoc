import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { Response } from 'express';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { File, FILE, FOLDER } from 'src/schemas/file.schema';
import { EditFileMetadataDto } from './dto/edit-file-metadata.dto';
import { CopyFileDto } from './dto/copy-file.dto';
import { FileSearchDto } from './dto/file-search.dto';
import { User } from 'src/schemas/user.schema';
import { LoggedUser } from 'src/auth/logged-user.decorator';
import { LoggedUserHash } from 'src/auth/logged-user-hash.decorator';
import { FileGuard } from 'src/files/file.guard';
import {
  CurrentFile,
  READ,
  WRITE,
  OWNER,
} from 'src/files/current-file.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';
import {
  SearchFilesResponse,
  GetResponse,
  CreateFileResponse,
} from './files.controller.types';
import { MongoSession } from 'src/mongo-session.decorator';
import { ClientSession } from 'mongoose';
import { CreateFileFromTemplateDto } from './dto/create-file-from-template.dto';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('search')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({ summary: 'Search files', description: 'Search files' })
  @ApiOkResponse({ description: 'Done', type: SearchFilesResponse })
  async search(@LoggedUser() user: User, @Body() fileSearchDto: FileSearchDto) {
    const files = await this.filesService.search(user, fileSearchDto);
    const results = await Promise.all(
      files.map(async (item) => {
        return await this.filesService.prepareFileForOutput(item);
      }),
    );

    return { msg: 'Done', results };
  }

  @Get(':fileID')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({ summary: 'Get a file', description: 'Get a file' })
  @ApiOkResponse({ description: 'File informations loaded', type: GetResponse })
  async get(@CurrentFile(READ) file: File) {
    const result = await this.filesService.prepareFileForOutput(file);
    if (file.type == FOLDER) {
      const folderContents = await this.filesService.getFolderContents(
        file._id,
      );

      //DirectoryContent
      (result as any).directoryContent = await Promise.all(
        folderContents.map(async (item) => {
          return await this.filesService.prepareFileForOutput(item);
        }),
      );

      //Path
      const path: Array<{ id: string; name: string }> = [];
      let aboveFile = file;
      while (aboveFile.parent_file_id != undefined) {
        aboveFile = await this.filesService.findOne(aboveFile.parent_file_id);
        path.push({ id: aboveFile._id, name: aboveFile.name });
      }
      path.reverse();
      (result as any).path = path;
    }

    return { msg: 'File informations loaded', content: result };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('upfile', 1))
  @HttpCode(HttpStatusCode.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a file', description: 'Create a file' })
  @ApiForbiddenResponse({
    description: 'The user have to be the owner of parent folder',
    type: GenericResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Trying to create a file without the `upfile` field, or `folderID` is not a valid folder',
    type: GenericResponse,
  })
  @ApiCreatedResponse({ description: 'File created', type: CreateFileResponse })
  async create(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser({ requireOwner: true }) user: User,
    @LoggedUserHash() userHash: string,
    @UploadedFiles() files,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    const newDirectoryMode = uploadFileDto.mimetype === 'application/x-dir';
    const fileIsPresent = files && files[0];
    if (!newDirectoryMode && !fileIsPresent) {
      throw new BadRequestException('Missing file');
    }

    let file = await this.filesService.create(
      mongoSession,
      user,
      uploadFileDto.name,
      uploadFileDto.mimetype,
      uploadFileDto.folderID,
    );
    if (!newDirectoryMode) {
      file = await this.filesService.setFileContent(
        mongoSession,
        user,
        userHash,
        file,
        files[0].buffer,
      );
    }

    return { msg: 'File created', fileID: file._id };
  }

  @Post('create-from-template')
  @HttpCode(HttpStatusCode.CREATED)
  @ApiOperation({
    summary: 'Create a file from a template',
    description: 'Create a file from a template',
  })
  @ApiForbiddenResponse({
    description: 'The user have to be the owner of parent folder',
    type: GenericResponse,
  })
  @ApiBadRequestResponse({
    description: '`folderID` is not a valid folder',
    type: GenericResponse,
  })
  @ApiNotFoundResponse({
    description: 'Template not found',
    type: GenericResponse,
  })
  @ApiCreatedResponse({ description: 'File created', type: CreateFileResponse })
  async createFromTemplate(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser({ requireOwner: true }) user: User,
    @LoggedUserHash() userHash: string,
    @Body() createFileFromTemplateDto: CreateFileFromTemplateDto,
  ) {
    const file = await this.filesService.createFromTemplate(
      mongoSession,
      user,
      userHash,
      createFileFromTemplateDto.name,
      createFileFromTemplateDto.folderID,
      createFileFromTemplateDto.templateID,
    );
    return { msg: 'File created', fileID: file._id };
  }

  @Put(':fileID')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @UseInterceptors(FilesInterceptor('upfile', 1))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ['upfile']: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['upfile'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Update file content',
    description: 'Update file content',
  })
  @ApiOkResponse({ description: 'File updated', type: GenericResponse })
  @ApiBadRequestResponse({
    description: '`fileID` is a folder or `upfile` field is missing',
    type: GenericResponse,
  })
  async updateFileContent(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @UploadedFiles() files,
    @CurrentFile(WRITE) file: File,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');

    if (files && files[0]) {
      await this.filesService.setFileContent(
        mongoSession,
        user,
        userHash,
        file,
        files[0].buffer,
      );
    } else {
      throw new BadRequestException('Missing file');
    }

    return { msg: 'File updated' };
  }

  @Patch(':fileID')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Update file metadata',
    description: 'Update file metadata',
  })
  @ApiOkResponse({
    description: 'File informations modified',
    type: GenericResponse,
  })
  @ApiBadRequestResponse({
    description: 'Cannot enable preview on folders',
    type: GenericResponse,
  })
  @ApiForbiddenResponse({
    description:
      'The user have to be the owner of the file to edit `preview`, `directoryID` and `shareMode` fields',
    type: GenericResponse,
  })
  async updateFileMetadata(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @Body() editFileMetadataDto: EditFileMetadataDto,
    @CurrentFile(WRITE) file: File,
  ) {
    await this.filesService.setFileMetadata(
      mongoSession,
      user,
      file,
      editFileMetadataDto,
    );

    return { msg: 'File informations modified' };
  }

  @Post(':fileID/copy')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.CREATED)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Create a copy of a file',
    description: 'Create a copy of a file',
  })
  @ApiCreatedResponse({ description: 'File copied', type: CreateFileResponse })
  @ApiForbiddenResponse({
    description: 'The user have to be the owner of parent folder',
    type: GenericResponse,
  })
  @ApiBadRequestResponse({
    description: 'Cannot copy a folder, or `folderID` is not a valid folder',
    type: GenericResponse,
  })
  async copy(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser({ requireOwner: true }) user: User,
    @LoggedUserHash() userHash: string,
    @Body() copyFileDto: CopyFileDto,
    @CurrentFile(READ) file: File,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');
    const copy = await this.filesService.copyFile(
      mongoSession,
      user,
      userHash,
      file,
      copyFileDto.copyFileName,
      copyFileDto.destID,
    );
    return { msg: 'File copied', fileID: copy._id };
  }

  @Get(':fileID/download')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiProduces('application/octet-stream')
  @ApiOperation({ summary: 'Download a file', description: 'Download a file' })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({
    description: 'Cannot download a folder',
    type: GenericResponse,
  })
  async download(
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @Res() res: Response,
    @CurrentFile(READ) file: File,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');
    res.set('Content-Type', file.mimetype);
    res.set('Content-Disposition', `attachment; filename="${file.name}"`);
    res.send(await this.filesService.getFileContent(user, userHash, file));
  }

  @Get(':fileID/export')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiProduces('application/pdf')
  @ApiOperation({
    summary: 'Export a file as PDF',
    description: 'Export a file as PDF',
  })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({
    description: 'Cannot export a folder',
    type: GenericResponse,
  })
  async generatePDF(
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @Res() res: Response,
    @CurrentFile(READ) file: File,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');

    let pdfFileName = file.name;
    if (pdfFileName.indexOf('.') !== -1) {
      pdfFileName = pdfFileName.substring(0, pdfFileName.lastIndexOf('.'));
    }
    pdfFileName += '.pdf';

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${pdfFileName}"`);
    res.send(await this.filesService.generatePDF(user, userHash, file));
  }

  @Get(':fileID/preview')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiProduces('image/png')
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Generate PNG preview of a file',
    description: 'Generate PNG preview of a file',
  })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({
    description: 'Cannot generate a preview of a folder',
    type: GenericResponse,
  })
  async generatePngPreview(
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @Res() res: Response,
    @CurrentFile(READ) file: File,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');
    if (!file.preview) {
      throw new BadRequestException('Preview is disabled for this file');
    }

    let pngFileName = file.name;
    if (pngFileName.indexOf('.') !== -1) {
      pngFileName = pngFileName.substring(0, pngFileName.lastIndexOf('.'));
    }
    pngFileName += '.pdf';

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename="${pngFileName}"`);
    res.send(await this.filesService.generatePngPreview(user, userHash, file));
  }

  @Delete(':fileID')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({ summary: 'Delete a file', description: 'Delete a file' })
  @ApiOkResponse({ description: 'File deleted', type: GenericResponse })
  async delete(@CurrentFile(OWNER) file: File) {
    await this.filesService.delete(file);
    return { msg: 'File deleted' };
  }

  @Delete(':fileID/sendBin')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({ summary: 'Send to bin', description: 'Send a file to the bin' })
  @ApiOkResponse({ description: 'File moved', type: GenericResponse })
  async sendToBin(@MongoSession() mongoSession: ClientSession,
                  @CurrentFile(OWNER) file: File,) {
    await this.filesService.sendToBin(file, mongoSession);
    return { msg: 'File moved to bin' };
  }
}
