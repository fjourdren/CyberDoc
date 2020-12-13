import { BadRequestException, Body, Controller, Delete, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { LoggedUser } from 'src/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { FilesTagsService } from './files-tags.service';
import { File } from 'src/schemas/file.schema';
import { CurrentFile, READ, WRITE, OWNER } from 'src/current-file.decorator';
import { FileGuard } from 'src/file.guard';

@Controller('files')
export class FilesTagsController {
    constructor(
        private readonly filesTagsService: FilesTagsService
    ) { }

    @Post(':fileID/tags')
    @UseGuards(FileGuard)
    async addTag(@LoggedUser() user: User, @CurrentFile(OWNER) file: File, @Body('tagId') tagID: string) {
        const tag = user.tags.find(tag => tag._id === tagID);
        if (!file) throw new NotFoundException("Tag not found");

        if (file.tags.find(tag => tag._id === tagID)) throw new BadRequestException("File already have this tag");
        await this.filesTagsService.addTagToFile(file, tag);
        return { msg: "Tag added to the file" };
    }

    @Delete(':fileID/tags/:tagID')
    @UseGuards(FileGuard)
    async removeTag(@LoggedUser() user: User, @CurrentFile(OWNER) file: File, @Param('tagID') tagID: string) {
        const tag = user.tags.find(tag => tag._id === tagID);
        if (!file) throw new NotFoundException("Tag not found");
        await this.filesTagsService.removeTagFromFile(file, tag);
        return { msg: "Tag removed from file" };
    }

}