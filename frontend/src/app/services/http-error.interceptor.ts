import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UsersService } from './users/users.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private usersService: UsersService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error, caught) => {
        if (error.status === 401 && !request.url.includes('auth/log')) {
          if (this.usersService.getActiveUser()) {
            this.usersService._setUser(null);
            location.replace('/login');
          }
          return caught;
        } else {
          throw error;
        }
      }),
    );
  }
}
