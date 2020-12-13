import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, Put, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { Response } from 'express';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { File, FILE, FOLDER } from 'src/schemas/file.schema';
import { EditFileMetadataDto } from './dto/edit-file-metadata.dto';
import { CopyFileDto } from './dto/copy-file.dto';
import { FileSearchDto } from './dto/file-search.dto';
import { User } from 'src/schemas/user.schema';
import { LoggedUser } from 'src/logged-user.decorator';
import { LoggedUserHash } from 'src/logged-user-hash.decorator';
import { FileGuard } from 'src/file.guard';
import { CurrentFile, READ, WRITE, OWNER } from 'src/current-file.decorator';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Get(':fileID')
    @UseGuards(FileGuard)
    async get(@LoggedUser() user: User, @CurrentFile(READ) file: File) {
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

        let fileContent: Buffer;
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

    @Put(":fileID")
    @UseGuards(FileGuard)
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async updateFileContent(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @UploadedFiles() files, @CurrentFile(WRITE) file: File) {
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");

        if (files) {
            const fileContent: Buffer = files[0].buffer;
            await this.filesService.setFileContent(user, userHash, file, fileContent);
        } else {
            throw new BadRequestException("Missing file");
        }

        return { msg: "File updated" };
    }

    @Patch(":fileID")
    @UseGuards(FileGuard)
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async updateFileMetadata(@LoggedUser() user: User, @Body() editFileMetadataDto: EditFileMetadataDto, @CurrentFile(WRITE) file: File) {
        if (editFileMetadataDto.name) file.name = editFileMetadataDto.name;
        if (editFileMetadataDto.folderID) file.parent_file_id = editFileMetadataDto.folderID;
        await this.filesService.save(file);
        return { msg: "File informations modified" };
    }

    @Post(":fileID/copy")
    @UseGuards(FileGuard)
    @UseInterceptors(FilesInterceptor('upfile', 1))
    async copy(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Body() copyFileDto: CopyFileDto, @CurrentFile(READ) file: File) {
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");
        const copy = await this.filesService.copyFile(user, userHash, file, copyFileDto.copyFileName, copyFileDto.destID);
        return { msg: "File copied", fileID: copy._id };
    }

    @Get(':fileID/download')
    @UseGuards(FileGuard)
    async download(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Res() res: Response, @CurrentFile(READ) file: File) {
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");
        res.send(await this.filesService.getFileContent(user, userHash, file));
    }

    @Get(':fileID/export')
    @UseGuards(FileGuard)
    async generatePDF(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Res() res: Response, @CurrentFile(READ) file: File) {
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");
        res.send(await this.filesService.generatePDF(user, userHash, file));
    }

    @Get(':fileID/preview')
    @UseGuards(FileGuard)
    async generatePngPreview(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Res() res: Response, @CurrentFile(READ) file: File) {
        if (file.type !== FILE) throw new BadRequestException("This action is only available with files");
        res.send(await this.filesService.generatePngPreview(user, userHash, file));
    }

    @Delete(':fileID')
    @UseGuards(FileGuard)
    async delete(@CurrentFile(OWNER) file: File) {
        await this.filesService.delete(file);
        return { msg: "File deleted" };
    }
}