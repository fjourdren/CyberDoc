import { BadRequestException, Body, Controller, Delete, NotFoundException, Param, Post, Req} from '@nestjs/common';
import { Request } from "express";
import { FilesService } from 'src/files/files.service';
import { UsersService } from 'src/users/users.service';
import { FilesTagsService } from './files-tags.service';

@Controller('files')
export class FilesTagsController {
    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
        private readonly filesTagsService: FilesTagsService
    ) { }

    @Post(':fileID/tags')
    async addTag(@Req() req: Request, @Param('fileID') fileID: string, @Body('tagId') tagID: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const file = await this.filesService.findOne(fileID);
        if (!file) throw new NotFoundException("File not found");

        const tag = user.tags.find(tag => tag._id === tagID);
        if (!file) throw new NotFoundException("Tag not found");

        if (file.tags.find(tag => tag._id === tagID)) throw new BadRequestException("File already have this tag");
        await this.filesTagsService.addTagToFile(file, tag);
    }

    @Delete(':fileID/tags/:tagID')
    async removeTag(@Req() req: Request, @Param('fileID') fileID: string, @Param('tagID') tagID: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        const file = await this.filesService.findOne(fileID);
        if (!file) throw new NotFoundException();

        const tag = user.tags.find(tag => tag._id === tagID);
        if (!file) throw new NotFoundException("Tag not found");
        await this.filesTagsService.removeTagFromFile(file, tag);
    }

}