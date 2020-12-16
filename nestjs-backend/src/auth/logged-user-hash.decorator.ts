import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export const LoggedUserHash = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userHash = request?.user?.userHash;

    if (!userHash) {
      throw new ForbiddenException('Missing userHash');
    }

    return userHash;
  },
);
