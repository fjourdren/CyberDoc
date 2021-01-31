import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from './utils/http-status-code';

@Injectable()
export class ErrorBanMiddleware implements NestMiddleware {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const ip =
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;

    const minute = new Date().getMinutes();
    const key = ip + ':' + minute;

    const nb_reqs = (await this.redis.get(key)) || 0;
    if (nb_reqs >= 10) {
      response.status(HttpStatusCode.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
        success: false,
        msg: 'Too many errors',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      next();
    }
  }
}
