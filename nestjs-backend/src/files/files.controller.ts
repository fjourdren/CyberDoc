import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, Patch, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { FILE, FOLDER } from 'src/schemas/file.schema';
import { EditFileMetadataDto } from './dto/edit-file-metadata.dto';
import { CopyFileDto } from './dto/copy-file.dto';
import { FileSearchDto } from './dto/file-search.dto';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService,
        private readonly usersService: UsersService) { }

    @Get(':id')
    async get(@Req() req: Request, @Param('id') id: string) {
        let file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();

        const fileOwner = await this.usersService.findOneByID(file.owner_id);
        if (!fileOwner) throw new InternalServerErrorException();

        (file as any).ownerName = `${fileOwner.firstname} ${fileOwner.lastname}`;
        delete file.parent_file_id;

        if (file.type == FOLDER) {
            const folderContents = await this.filesService.getFolderContents(file._id);
            (file as any).directoryContent = await Promise.all(folderContents.map(async item => {
                const itemOwner = await this.usersService.findOneByID(item.owner_id);
                if (!itemOwner) throw new InternalServerErrorException();
                (item as any).ownerName = `${itemOwner.firstname} ${itemOwner.lastname}`;
                return item;
            }));
        }

        return file;
    }

    @Post()
    async search(@Req() req: Request, @Body() fileSearchDto: FileSearchDto) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        return this.filesService.search(user, fileSearchDto);
    }

    @Post()
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async create(@Req() req: Request, @UploadedFiles() files, @Body() uploadFileDto: UploadFileDto) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const userHash = (req.user as any).userHash;
        const newDirectoryMode = uploadFileDto.mimetype === "application/x-dir";

        let fileContent: Buffer | null = null;
        if (!newDirectoryMode) {
            if (files) {
                fileContent = files[0].buffer;
            } else {
                throw new BadRequestException("Missing file");
            }
        }

        let file = await this.filesService.create(user, uploadFileDto.name, uploadFileDto.mimetype, uploadFileDto.folderID);
        if (!newDirectoryMode) {
            file = await this.filesService.setFileContent(user, userHash, file, fileContent);
        }

        return file;
    }

    @Put(":id")
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async updateFileContent(@Req() req: Request, @UploadedFiles() files, @Param('id') id: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const userHash = (req.user as any).userHash;
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        if (files) {
            const fileContent: Buffer = files[0].buffer;
            await this.filesService.setFileContent(user, userHash, file, fileContent);
        } else {
            throw new BadRequestException("Missing file");
        }
    }

    @Patch(":id")
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async updateFileMetadata(@Req() req: Request, @Body() editFileMetadataDto: EditFileMetadataDto, @Param('id') id: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();

        if (editFileMetadataDto.name) file.name = editFileMetadataDto.name;
        if (editFileMetadataDto.folderID) file.parent_file_id = editFileMetadataDto.folderID;
        await this.filesService.save(file);
    }

    @Post(":id/copy")
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async copy(@Req() req: Request, @Body() copyFileDto: CopyFileDto, @Param('id') id: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const userHash = (req.user as any).userHash;
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");
        return await this.filesService.copyFile(user, userHash, file, copyFileDto.copyFileName, copyFileDto.destID);
    }

    @Get(':id/download')
    async download(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const userHash = (req.user as any).userHash;
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        res.send(await this.filesService.getFileContent(user, userHash, file));
    }

    @Get(':id/export')
    async generatePDF(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const userHash = (req.user as any).userHash;
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        res.send(await this.filesService.generatePDF(user, userHash, file));
    }

    @Get(':id/preview')
    async generatePngPreview(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const userHash = (req.user as any).userHash;
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        res.send(await this.filesService.generatePngPreview(user, userHash, file));
    }

    @Delete(':id')
    async delete(@Req() req: Request, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        await this.filesService.delete(file);
    }
}