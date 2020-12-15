import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { File, ShareMode } from '../schemas/file.schema';
import { User } from '../schemas/user.schema';

export const READ = 1;
export const WRITE = 2;
export const OWNER = 3;

export const CurrentFile = createParamDecorator(
    (requiredAccess: number, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const file: File = request.file;
        const user: User = request.user.user;
        if (!file) throw new InternalServerErrorException("@CurrentFile is used without @FileGuard !");

        let availableAccess = 0;
        if (file.owner_id === user._id) {
            availableAccess = OWNER
        } else if (file.sharedWith.includes(user._id)) {
            availableAccess = file.shareMode === ShareMode.READWRITE ? WRITE : READ;
        }

        if (requiredAccess > availableAccess) {
            throw new ForbiddenException();
        }

        return request.file;
    },
);