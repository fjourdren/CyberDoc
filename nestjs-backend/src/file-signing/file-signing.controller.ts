import { BadRequestException, Controller, NotFoundException, Param, Post } from '@nestjs/common';
import { FilesService } from 'src/files/files.service';
import { LoggedUserHash } from 'src/logged-user-hash.decorator';
import { LoggedUser } from 'src/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
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
    async addSign(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @Param('fileID') fileID: string) {
        const file = await this.filesService.findOne(fileID);
        if (!file) throw new NotFoundException("File not found");
        if (file.signs.find(item => item.user_email === user.email)) throw new BadRequestException("You already signed that document");
        await this.fileSigningService.addSign(user, userHash, file);
        return { msg: "Success" };
    }
}
