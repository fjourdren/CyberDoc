import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  redis: Redis.Redis;
  constructor(configService: ConfigService) {
    this.redis = new Redis(configService.get<string>('REDIS_URL'));
  }

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const ip =
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;

    const minute = new Date().getMinutes();
    const key = ip + ':' + minute;
    this.redis.multi().incr(key).expire(key, 59).exec(); // increment number of error of that user and put an expiration time of 59s

    response.status(status).json({
      statusCode: status,
      success: false,
      msg: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
