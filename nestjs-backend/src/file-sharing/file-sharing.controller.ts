import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { FilesService } from 'src/files/files.service';
import { LoggedUserHash } from 'src/logged-user-hash.decorator';
import { LoggedUser } from 'src/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { FileSharingService } from './file-sharing.service';
import { File } from 'src/schemas/file.schema';
import { CurrentFile, READ, OWNER } from 'src/current-file.decorator';
import { FileGuard } from 'src/file.guard';

@Controller('files')
export class FileSharingController {
    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
        private readonly fileSharingService: FileSharingService
    ) { }

    @Get('shared')
    async getSharedFiles(@LoggedUser() currentUser: User) {
        const sharedFiles = await this.fileSharingService.getSharedFiles(currentUser);

        const results = await Promise.all(sharedFiles.map(async value => {
            return await this.filesService.prepareFileForOutput(value);
        }));

        return { msg: "Success", results };
    }

    @Get(':fileID/sharing')
    @UseGuards(FileGuard)
    async getSharingAccess(@LoggedUser() currentUser: User, @CurrentFile(READ) file: File) {
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
    @UseGuards(FileGuard)
    async addSharingAccess(@LoggedUser() currentUser: User, @LoggedUserHash() currentUserHash: string, @CurrentFile(OWNER) file: File, @Body('email') email: string) {
        if (currentUser.email === email) {
            throw new BadRequestException("You cannot share a file with yourself");
        }

        await this.fileSharingService.addSharingAccess(currentUser, currentUserHash, email, file);
        return { msg: "Success" };
    }

    @Delete(':fileID/sharing/:email')
    @UseGuards(FileGuard)
    async removeSharingAccess(@LoggedUser() currentUser: User, @CurrentFile(OWNER) file: File, @Param('email') email: string) {
        if (currentUser.email === email) {
            throw new BadRequestException("You cannot share a file with yourself");
        }

        await this.fileSharingService.removeSharingAccess(currentUser, email, file);
        return { msg: "Success" };
    }

}
