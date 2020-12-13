import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { FILE, FOLDER } from 'src/schemas/file.schema';
import { EditFileMetadataDto } from './dto/edit-file-metadata.dto';
import { CopyFileDto } from './dto/copy-file.dto';
import { FileSearchDto } from './dto/file-search.dto';
import { User } from 'src/schemas/user.schema';
import { LoggedUser } from 'src/logged-user.decorator';
import { LoggedUserHash } from 'src/logged-user-hash.decorator';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService,
        private readonly usersService: UsersService) { }

    @Get(':id')
    async get(@LoggedUser() user: User, @Param('id') id: string) {
        let file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();

        let result = await this.filesService.prepareFileForOutput(file);
        if (file.type == FOLDER) {
            const folderContents = await this.filesService.getFolderContents(file._id);

            //DirectoryContent
            (result as any).directoryContent = await Promise.all(folderContents.map(async item => {
                return await this.filesService.prepareFileForOutput(item);
            }));

            //Path
            const path: Array<{ id: string, name: string }> = [];
            let aboveFile = file;
            while (aboveFile.parent_file_id != undefined) {
                aboveFile = await this.filesService.findOne(aboveFile.parent_file_id);
                path.push({ "id": aboveFile._id, "name": aboveFile.name });
            }
            path.reverse();
            (result as any).path = path;
        }

        return { msg: "File informations loaded", content: result };
    }

    @Post()
    async search(@LoggedUser() user: User, @Body() fileSearchDto: FileSearchDto) {
        const files = await this.filesService.search(user, fileSearchDto);

        const results = await Promise.all(files.map(async item => {
            return await this.filesService.prepareFileForOutput(item);
        }));

        return { msg: "Done", results };
    }

    @Post()
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async create(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @UploadedFiles() files, @Body() uploadFileDto: UploadFileDto) {
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

        return { msg: "File created", fileID: file._id };
    }

    @Put(":id")
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async updateFileContent(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @UploadedFiles() files, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        if (files) {
            const fileContent: Buffer = files[0].buffer;
            await this.filesService.setFileContent(user, userHash, file, fileContent);
        } else {
            throw new BadRequestException("Missing file");
        }

        return { msg: "File updated" };
    }

    @Patch(":id")
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async updateFileMetadata(@LoggedUser() user: User, @Body() editFileMetadataDto: EditFileMetadataDto, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();

        if (editFileMetadataDto.name) file.name = editFileMetadataDto.name;
        if (editFileMetadataDto.folderID) file.parent_file_id = editFileMetadataDto.folderID;
        await this.filesService.save(file);
        return { msg: "File informations modified" };
    }

    @Post(":id/copy")
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async copy(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Body() copyFileDto: CopyFileDto, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");
        const copy = await this.filesService.copyFile(user, userHash, file, copyFileDto.copyFileName, copyFileDto.destID);
        return { msg: "File copied", fileID: copy._id };
    }

    @Get(':id/download')
    async download(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Res() res: Response, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        res.send(await this.filesService.getFileContent(user, userHash, file));
    }

    @Get(':id/export')
    async generatePDF(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Res() res: Response, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        res.send(await this.filesService.generatePDF(user, userHash, file));
    }

    @Get(':id/preview')
    async generatePngPreview(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Res() res: Response, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        res.send(await this.filesService.generatePngPreview(user, userHash, file));
    }

    @Delete(':id')
    async delete(@LoggedUser() user: User, @Param('id') id: string) {
        const file = await this.filesService.findOne(id);
        if (!file) throw new NotFoundException();
        await this.filesService.delete(file);
        return { msg: "File deleted" };
    }
}