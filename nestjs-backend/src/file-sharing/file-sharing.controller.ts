import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Req } from '@nestjs/common';
import { Request } from "express";
import { FilesService } from 'src/files/files.service';
import { UsersService } from 'src/users/users.service';
import { FileSharingService } from './file-sharing.service';

@Controller('files')
export class FileSharingController {
    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
        private readonly fileSharingService: FileSharingService
    ) { }

    @Get('shared')
    async getSharedFiles(@Req() req: Request) {
        const currentUser = await this.usersService.findOneByID((req.user as any).userID);
        const sharedFiles = await this.fileSharingService.getSharedFiles(currentUser);

        const results = await Promise.all(sharedFiles.map(async value => {
            return await this.filesService.prepareFileForOutput(value);
        }));

        return { msg: "Success", results };
    }

    @Get(':fileID/sharing')
    async getSharingAccess(@Req() req: Request, @Param('fileID') fileID: string) {
        const currentUser = await this.usersService.findOneByID((req.user as any).userID);
        const file = await this.filesService.findOne(fileID);
        if (!file) throw new NotFoundException("File not found");

        if (currentUser._id !== file.owner_id && !file.sharedWith.find(item => item === currentUser._id)) {
            throw new NotFoundException("File not found")
        }

        const sharedUsersPending = file.shareWithPending.map(item => item.email);
        const sharedUsers = await Promise.all(file.sharedWith.map(async item => {
            const user = await this.usersService.findOneByID(item)
            return {
                email: user.email,
                name: `${user.firstname} ${user.lastname}`
            }
        }));

        return {
            msg: "Success",
            shared_users: sharedUsers,
            shared_users_pending: sharedUsersPending
        }
    }

    @Post(':fileID/sharing')
    async addSharingAccess(@Req() req: Request, @Param('fileID') fileID: string, @Body('email') email: string) {
        const currentUser = await this.usersService.findOneByID((req.user as any).userID);
        const currentUserHash = (req.user as any).userHash;
        const file = await this.filesService.findOne(fileID);
        if (!file) throw new NotFoundException("File not found");

        if (currentUser.email === email) {
            throw new BadRequestException("You cannot share a file with yourself");
        }

        await this.fileSharingService.addSharingAccess(currentUser, currentUserHash, email, file);
        return { msg: "Success" };
    }

    @Delete(':fileID/sharing/:email')
    async removeSharingAccess(@Req() req: Request, @Param('fileID') fileID: string, @Param('email') email: string) {
        const currentUser = await this.usersService.findOneByID((req.user as any).userID);
        const file = await this.filesService.findOne(fileID);
        if (!file) throw new NotFoundException("File not found");

        if (currentUser.email === email) {
            throw new BadRequestException("You cannot share a file with yourself");
        }

        await this.fileSharingService.removeSharingAccess(currentUser, email, file);
        return { msg: "Success" };
    }

}
