import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpServer,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly redis: Redis.Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly _applicationRef?: HttpServer,
  ) {
    super(_applicationRef);
    this.redis = new Redis(configService.get<string>('REDIS_URL'));
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const ip =
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;

    const minute = new Date().getMinutes();
    const key = ip + ':' + minute;
    this.redis.multi().incr(key).expire(key, 59).exec(); // increment number of error of that user and put an expiration time of 59s
    if (response.headersSent) return;

    if (exception instanceof HttpException) {
      const newException = new HttpException(
        {
          statusCode: exception.getStatus(),
          success: false,
          msg: `${exception.message}`,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
        exception.getStatus(),
      );

      super.catch(newException, host);
    } else {
      super.catch(exception, host);
    }
  }
}
