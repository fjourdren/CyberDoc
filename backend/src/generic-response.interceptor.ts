import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class GenericResponse {
  @ApiProperty({ description: 'Message', example: 'Success' })
  msg: string;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Is request succesful or not', example: true })
  success: boolean;
}

@Injectable()
export class GenericResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const msg = data.msg;
        if (!msg)
          throw new InternalServerErrorException(
            'Each endpoint must return a object with `msg` key !',
          );
        const statusCode = context.switchToHttp().getResponse().statusCode;
        const success = statusCode >= 200 && statusCode <= 299;
        delete data.msg;
        return { statusCode, msg, success, ...data };
      }),
    );
  }
}
