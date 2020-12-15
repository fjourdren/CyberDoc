import { BadRequestException, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { LoggedUserHash } from 'src/auth/logged-user-hash.decorator';
import { LoggedUser } from 'src/auth/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { FileSigningService } from './file-signing.service';
import { File } from 'src/schemas/file.schema';
import { CurrentFile, READ } from 'src/files/current-file.decorator';
import { FileGuard } from 'src/files/file.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';

@ApiTags("file-signing")
@ApiBearerAuth()
@Controller('files')
export class FileSigningController {

    constructor(
        private readonly fileSigningService: FileSigningService
    ) { }

    @Post(':fileID/sign')
    @UseGuards(FileGuard)
    @HttpCode(HttpStatusCode.CREATED)
    @ApiParam({ name: "fileID", description: "File ID", example: "f3f36d40-4785-198f-e4a6-2cef906c2aeb" })
    @ApiOperation({ summary: "Sign a file", description: "Sign a file" })
    @ApiCreatedResponse({ description: "Success", type: GenericResponse })
    @ApiBadRequestResponse({ description: "User already signed that document", type: GenericResponse })
    async addSign(@LoggedUser() user: User, @LoggedUserHash() userHash: string, @CurrentFile(READ) file: File) {
        if (file.signs.find(item => item.user_email === user.email)) throw new BadRequestException("You already signed that document");
        await this.fileSigningService.addSign(user, userHash, file);
        return { msg: "Success" };
    }
}
