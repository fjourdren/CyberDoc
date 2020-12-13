import { BadRequestException, Controller, NotFoundException, Param, Post, Req } from '@nestjs/common';
import { Request } from "express";
import { FilesService } from 'src/files/files.service';
import { UsersService } from 'src/users/users.service';
import { FileSigningService } from './file-signing.service';

@Controller('files')
export class FileSigningController {

    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
        private readonly fileSigningService: FileSigningService
    ) {}

    @Post(':fileID/sign')
    async addSign(@Req() req: Request, @Param('fileID') fileID: string) {
        const currentUser = await this.usersService.findOneByID((req.user as any).userID);
        const currentUserHash = (req.user as any).userHash;
        const file = await this.filesService.findOne(fileID);
        if (!file) throw new NotFoundException("File not found");
        if (file.signs.find(item => item.user_email === currentUser.email)) throw new BadRequestException("You already signed that document");
        await this.fileSigningService.addSign(currentUser, currentUserHash, file);
        return { msg: "Success" };
    }
}
