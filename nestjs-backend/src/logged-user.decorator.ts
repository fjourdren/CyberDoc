import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LoggedUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        //This property is added in src\auth\jwt\jwt-auth.guard.ts
        return request.user.user;
    },
);