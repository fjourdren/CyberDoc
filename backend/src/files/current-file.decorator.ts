import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { File } from '../schemas/file.schema';
import { User } from '../schemas/user.schema';
import { FileAcl } from './file-acl';

export const CurrentFile = createParamDecorator(
  (requiredAccess: number, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const file: File = request.file;
    const user: User = request.user.user;
    if (!file)
      throw new InternalServerErrorException(
        '@CurrentFile is used without @FileGuard !',
      );

    if (requiredAccess > FileAcl.getAvailableAccess(file, user)) {
      throw new ForbiddenException();
    }

    return request.file;
  },
);
