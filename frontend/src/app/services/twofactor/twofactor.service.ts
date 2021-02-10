import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UsersService } from '../users/users.service';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorService {
  constructor(
    private httpClient: HttpClient,
    private usersService: UsersService,
  ) {}

  sendTokenByEmail(): Observable<any> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/two-factor-auth/sendToken`,
        {
          type: 'email',
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  sendTokenBySms(): Observable<any> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/two-factor-auth/sendToken`,
        {
          type: 'sms',
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  verifyToken(type: string | undefined, token: string): Promise<any> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/two-factor-auth/verifyToken`,
        {
          type,
          twoFactorToken: token,
        },
        { withCredentials: true },
      )
      .toPromise()
      .then(async () => {
        await this.usersService.refreshActiveUser().toPromise();
      });
  }

  generateSecretUriAndQr(): Observable<any> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/two-factor-auth/generateSecret`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  useRecoveryCode(code: string): Observable<boolean> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/two-factor-auth/useRecoveryCode`,
        { twoFactorRecoveryCode: code },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          return response.msg.hasRecoveryCodesLeft;
        }),
      );
  }

  generateRecoveryCodes(): Observable<string[]> {
    return this.httpClient
      .get<any>(
        `${environment.apiBaseURL}/two-factor-auth/generateRecoveryCodes`,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => {
          return response.msg;
        }),
      );
  }
}
