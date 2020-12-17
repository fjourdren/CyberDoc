import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User, UserRole } from 'src/schemas/user.schema';

export const LoggedUser = createParamDecorator(
  (data: { requireOwner: boolean }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    //This property is added in src\auth\jwt\jwt-auth.guard.ts
    const user: User = request?.user?.user;

    if (!user) {
      throw new ForbiddenException('Missing auth');
    }

    if (user.role !== UserRole.OWNER && data?.requireOwner) {
      throw new ForbiddenException('You have to be an owner for this action');
    }

    return user;
  },
);
