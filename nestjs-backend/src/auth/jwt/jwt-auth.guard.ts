import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SKIP_JWT_AUTH_KEY } from 'src/auth/jwt/skip-jwt-auth.annotation';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const skipJWTAuth = this.reflector.getAllAndOverride<boolean>(SKIP_JWT_AUTH_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipJWTAuth) {
            return true;
        }
        return super.canActivate(context);
    }
}
