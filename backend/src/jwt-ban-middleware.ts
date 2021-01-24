import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JWTBanMiddleware implements NestMiddleware {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const jwt =
      request.cookies[this.configService.get<string>('JWT_COOKIE_NAME')];

    if ((await this.redis.get('banjwt_' + jwt)) != undefined) {
      response.status(401).json({
        statusCode: 401,
        msg: 'JWT token is disabled',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      next();
    }
  }
}
