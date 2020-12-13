import { BadRequestException, Controller, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { LoggedUserHash } from 'src/logged-user-hash.decorator';
import { LoggedUser } from 'src/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { FileSigningService } from './file-signing.service';
import { File } from 'src/schemas/file.schema';
import { CurrentFile, READ } from 'src/current-file.decorator';
import { FileGuard } from 'src/file.guard';

@Controller('files')
export class FileSigningController {

    constructor(
        private readonly fileSigningService: FileSigningService
    ) { }

    @Post(':fileID/sign')
    @UseGuards(FileGuard)
    async addSign(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @CurrentFile(READ) file: File) {
        if (file.signs.find(item => item.user_email === user.email)) throw new BadRequestException("You already signed that document");
        await this.fileSigningService.addSign(user, userHash, file);
        return { msg: "Success" };
    }
}
