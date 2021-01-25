import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  redis: Redis.Redis;

  constructor(configService: ConfigService) {
    this.redis = new Redis(configService.get<string>('REDIS_URL'));
  }

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const ip =
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;
    if (response.headersSent) return;

    const minute = new Date().getMinutes();
    const key = ip + ':' + minute;
    await this.redis.multi().incr(key).expire(key, 59).exec(); // increment number of error of that user and put an expiration time of 59s

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        success: false,
        msg: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        msg: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
