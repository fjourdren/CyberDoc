import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GenericResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const msg = data.msg;
        if (!msg) throw new InternalServerErrorException("Each endpoint must return a object with `msg` key !");
        const statusCode = context.switchToHttp().getResponse().statusCode;
        const success = (statusCode >= 200) && (statusCode <= 299);
        delete data.msg;
        return { statusCode, msg, success, ...data };
      })
    );
  }
}
