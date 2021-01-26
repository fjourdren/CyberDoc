import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SKIP_JWT_AUTH_KEY } from './skip-jwt-auth.annotation';
import { Reflector } from '@nestjs/core';
import { SHA3 } from 'sha3';
import { HttpStatusCode } from '../../utils/http-status-code';
import { ConfigService } from '@nestjs/config';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { REDIS_BANJWT_KEY } from '../auth.service';

@Injectable()
export class JwtBanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const skipJWTAuth = this.reflector.getAllAndOverride<boolean>(
      SKIP_JWT_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipJWTAuth) return true;
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const jwt =
      request.cookies[this.configService.get<string>('JWT_COOKIE_NAME')];

    const hashObj = new SHA3();
    hashObj.update(jwt);
    const hashedJWT = hashObj.digest('hex');

    return this.redis.get(REDIS_BANJWT_KEY(hashedJWT)).then((value) => {
      if (value) {
        response.status(HttpStatusCode.UNAUTHORIZED).json({
          statusCode: HttpStatusCode.UNAUTHORIZED,
          success: false,
          msg: 'JWT token is disabled',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        return false;
      } else {
        return true;
      }
    });
  }
}
