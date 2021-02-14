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
  Query,
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
import { CurrentFile } from 'src/files/current-file.decorator';
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
  ApiResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';
import {
  CreateFileResponse,
  GetFileResponse,
  GetResponse,
  MultipleFilesResponse,
} from './files.controller.types';
import { MongoSession } from 'src/mongo-session.decorator';
import { ClientSession } from 'mongoose';
import { CreateFileFromTemplateDto } from './dto/create-file-from-template.dto';
import { CurrentDevice } from '../users/current-device.decorator';
import { UserDevice } from '../schemas/user-device.schema';
import {
  ETHERPAD_MIMETYPE,
  EtherpadExportFormat,
  getMimetypeForEtherpadExportFormat,
} from './etherpad/etherpad';
import { Utils } from '../utils';
import { FileAcl } from './file-acl';
import { DOCUMENT_MIMETYPES, TEXT_MIMETYPES } from './file-types';
const contentDisposition = require('content-disposition');

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('search')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({ summary: 'Search files', description: 'Search files' })
  @ApiOkResponse({ description: 'Done', type: MultipleFilesResponse })
  async search(@LoggedUser() user: User, @Body() fileSearchDto: FileSearchDto) {
    const files = await this.filesService.search(user, fileSearchDto);
    const results = await Promise.all(
      files.map(async (item) => {
        return await this.filesService.prepareFileForOutput(item);
      }),
    );

    return { msg: 'Done', results };
  }

  @Get('bin')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Get bin content',
    description: 'Get bin content',
  })
  @ApiOkResponse({ description: 'Success', type: MultipleFilesResponse })
  async getBin(@LoggedUser() currentUser: User) {
    const binContents = await this.filesService.getBin(currentUser);

    const results = await Promise.all(
      binContents.map(async (value) => {
        return await this.filesService.prepareFileForOutput(value);
      }),
    );

    return { msg: 'Success', results };
  }

  @Delete('bin')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Purge bin content',
    description: 'Purge bin content',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  async purgeBin(@LoggedUser() currentUser: User) {
    const binContents = await this.filesService.getBin(currentUser);

    for (const item of binContents) {
      await this.filesService.delete(item);
    }

    return { msg: 'Success' };
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
  @ApiOkResponse({ description: 'File information loaded', type: GetResponse })
  async get(@CurrentFile(FileAcl.READ) file: File) {
    const result = await this.filesService.prepareFileForOutput(file);
    if (file.type == FOLDER) {
      let folderContents = await this.filesService.getFolderContents(file._id);

      const binTest: File[] = [];
      for (const element of folderContents) {
        if (!element.bin_id) {
          binTest.push(element);
        }
      }

      folderContents = binTest;

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

    return { msg: 'File information loaded', content: result };
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
  @ApiResponse({
    status: 507,
    description: 'Insufficient storage',
    type: GenericResponse,
  })
  @ApiCreatedResponse({ description: 'File created', type: CreateFileResponse })
  async create(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser({ requireOwner: true }) user: User,
    @LoggedUserHash() userHash: string,
    @CurrentDevice() currentDevice: UserDevice,
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
      currentDevice,
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
  @ApiResponse({
    status: 507,
    description: 'Insufficient storage',
    type: GenericResponse,
  })
  @ApiCreatedResponse({ description: 'File created', type: CreateFileResponse })
  async createFromTemplate(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser({ requireOwner: true }) user: User,
    @CurrentDevice() currentDevice: UserDevice,
    @LoggedUserHash() userHash: string,
    @Body() createFileFromTemplateDto: CreateFileFromTemplateDto,
  ) {
    const file = await this.filesService.createFromTemplate(
      mongoSession,
      user,
      currentDevice,
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
  @ApiResponse({
    status: 507,
    description: 'Insufficient storage',
    type: GenericResponse,
  })
  async updateFileContent(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @UploadedFiles() files,
    @CurrentFile(FileAcl.WRITE) file: File,
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
    description: 'File information modified',
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
    @CurrentFile(FileAcl.WRITE) file: File,
  ) {
    await this.filesService.setFileMetadata(
      mongoSession,
      user,
      file,
      editFileMetadataDto,
    );

    return { msg: 'File information modified' };
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
  @ApiResponse({
    status: 507,
    description: 'Insufficient storage',
    type: GenericResponse,
  })
  async copy(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser({ requireOwner: true }) user: User,
    @CurrentDevice() currentDevice: UserDevice,
    @LoggedUserHash() userHash: string,
    @Body() copyFileDto: CopyFileDto,
    @CurrentFile(FileAcl.READ) file: File,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');
    const copy = await this.filesService.copyFile(
      mongoSession,
      user,
      currentDevice,
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
  @ApiQuery({
    name: 'etherpad_export_format',
    description:
      'When the user download an etherpad file, specify the format to use for export (required). For other files this field must be `null`',
    example: '',
    enum: EtherpadExportFormat,
    required: false,
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
    @CurrentFile(FileAcl.READ) file: File,
    @Query('etherpad_export_format')
    etherpadExportFormat: EtherpadExportFormat = null,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');

    const isEtherpadFile = file.mimetype === ETHERPAD_MIMETYPE;
    if (!isEtherpadFile && etherpadExportFormat != null) {
      throw new BadRequestException(
        '`etherpad_export_format` query param have to be empty for non-etherpad files',
      );
    } else if (isEtherpadFile && etherpadExportFormat == null) {
      throw new BadRequestException(
        '`etherpad_export_format` query param is required for etherpad files',
      );
    }

    if (isEtherpadFile) {
      // this function throws BadRequestException if etherpadExportFormat is invalid
      const filename = Utils.replaceFileExtension(
        file.name,
        etherpadExportFormat,
      );
      const content = this.filesService.exportEtherpadPadAssociatedWithFile(
        user,
        userHash,
        file,
        etherpadExportFormat,
      );
      res.set(
        'Content-Type',
        getMimetypeForEtherpadExportFormat(etherpadExportFormat),
      );
      res.set('Content-Disposition', contentDisposition(filename));
      res.send(await content);
    } else {
      const content = this.filesService.getFileContent(user, userHash, file);
      res.set('Content-Type', file.mimetype);
      res.set('Content-Disposition', contentDisposition(file.name));
      res.send(await content);
    }
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
    @CurrentFile(FileAcl.READ) file: File,
  ) {
    if (file.type !== FILE)
      throw new BadRequestException('This action is only available with files');

    let pdfFileName = Utils.replaceFileExtension(file.name, 'pdf');
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', contentDisposition(pdfFileName));
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
    @CurrentFile(FileAcl.READ) file: File,
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
    res.set('Content-Disposition', contentDisposition(pngFileName));
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
  async delete(@CurrentFile(FileAcl.OWNER) file: File) {
    await this.filesService.delete(file);
    return { msg: 'File deleted' };
  }

  @Get(':fileID/sync-file-with-etherpad-and-get-info')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Sync file with etherpad and returns info about it',
    description: 'Sync file with etherpad and returns info about it',
  })
  @ApiOkResponse({ description: 'OK', type: GetFileResponse })
  @ApiBadRequestResponse({
    description: 'This action is only available for etherpad files',
    type: GenericResponse,
  })
  async syncFileWithEtherpadAndGetInfo(
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @CurrentFile(FileAcl.WRITE) file: File,
  ) {
    if (file.mimetype !== ETHERPAD_MIMETYPE) {
      throw new BadRequestException(
        'This action is only available for etherpad files',
      );
    }

    const fileInfo = await this.filesService.syncFileWithEtherpadAndGetInfo(
      user,
      userHash,
      file,
    );
    return { msg: 'OK', file: fileInfo };
  }

  @Post(':fileID/convert-to-etherpad')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Convert a office file to a .etherpad file',
    description: 'Convert a office file to a .etherpad file',
  })
  @ApiOkResponse({ description: 'OK', type: GenericResponse })
  @ApiBadRequestResponse({
    description:
      'This action is only available for files which can converted in etherpad format ',
    type: GenericResponse,
  })
  async convertFileToEtherPadFormat(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @CurrentFile(FileAcl.OWNER) file: File,
  ) {
    const validMimetypes = [...TEXT_MIMETYPES, ...DOCUMENT_MIMETYPES];

    if (!validMimetypes.includes(file.mimetype))
      throw new BadRequestException(
        'Etherpad conversion is not available for this file',
      );

    await this.filesService.convertFileToEtherPadFormat(
      mongoSession,
      user,
      userHash,
      file,
    );
    return { msg: 'OK' };
  }

  @Get(':fileID/on-all-users-leave-etherpad-pad')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Called by Etherpad when all users have leave a pad',
    description: 'Called by Etherpad when all users have leave a pad',
  })
  @ApiOkResponse({ description: 'OK', type: GenericResponse })
  @ApiBadRequestResponse({
    description: 'This action is only available for etherpad files',
    type: GenericResponse,
  })
  async onAllUsersLeaveEtherpadPad(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @LoggedUserHash() userHash: string,
    @CurrentFile(FileAcl.READ) file: File,
  ) {
    if (file.mimetype !== ETHERPAD_MIMETYPE) {
      throw new BadRequestException(
        'This action is only available for etherpad files',
      );
    }

    await this.filesService.onAllUsersLeaveEtherpadPad(
      mongoSession,
      user,
      userHash,
      file,
    );
    return { msg: 'OK' };
  }

  @Delete(':fileID/sendBin')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Send to bin',
    description: 'Send a file to the bin',
  })
  @ApiOkResponse({ description: 'File moved', type: GenericResponse })
  async sendToBin(
    @MongoSession() mongoSession: ClientSession,
    @CurrentFile(FileAcl.OWNER) file: File,
  ) {
    await this.filesService.sendToBin(file, mongoSession);
    return { msg: 'File moved to bin' };
  }

  @Get(':fileID/restore')
  @UseGuards(FileGuard)
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'fileID',
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({
    summary: 'Restore from bin',
    description: 'Restore a file from the bin',
  })
  @ApiOkResponse({ description: 'File moved', type: GenericResponse })
  async restore(
    @MongoSession() mongoSession: ClientSession,
    @CurrentFile(FileAcl.OWNER) file: File,
  ) {
    await this.filesService.restore(file, mongoSession);
    return { msg: 'File restored from bin' };
  }
}
