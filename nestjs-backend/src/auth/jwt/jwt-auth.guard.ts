import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'express';
import { Observable, isObservable } from 'rxjs';
import { SKIP_JWT_AUTH_KEY } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService,
    ) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const skipJWTAuth = this.reflector.getAllAndOverride<boolean>(SKIP_JWT_AUTH_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (skipJWTAuth) return true;

        // Convert result to Promise<boolean> if needed
        const result = super.canActivate(context);
        let promise: Promise<boolean>;
        if (isObservable(result)) {
            promise = result.toPromise();
        } else if (result === true || result === false) {
            promise = Promise.resolve(result);
        } else {
            promise = result;
        }

        return promise.then(authOK => {
            if (authOK) {
                const request = context.switchToHttp().getRequest();
                return this.usersService.findOneByID(request.user.userID).then(user => {
                    request.user.user = user;
                }).then(() => true);
            } else {
                return false;
            }
        });
    }
}
