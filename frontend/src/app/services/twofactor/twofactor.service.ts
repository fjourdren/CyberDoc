import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorService {
  constructor(private httpClient: HttpClient) {}

  sendTokenBySms(phoneNumber: string | undefined): Observable<any> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/2fa/send/sms`,
        {
          phoneNumber,
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  verifyTokenBySms(
    phoneNumber: string | undefined,
    token: string,
  ): Observable<boolean> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/2fa/verify/token/sms`,
        {
          phoneNumber,
          token,
        },
        { withCredentials: true },
      )
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map((response) => {
          /*if (response.success) {
            this.cookieService.set(
              environment.authCookieName,
              response.token,
              this.jwtHelper.getTokenExpirationDate(response.token),
              '/',
              environment.authCookieDomain,
            );
            localStorage.setItem(
              'real_user',
              JSON.stringify(this.jwtHelper.decodeToken(response.token).user),
            );
          }
          return response.success;*/
          //TODO
          return false;
        }),
      );
  }

  verifyTokenByApp(
    secret: string | undefined,
    token: string,
  ): Observable<boolean> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/2fa/verify/token/app`,
        {
          secret,
          token,
        },
        { withCredentials: true },
      )
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map((response) => {
          /*if (response.success) {
            this.cookieService.set(
              environment.authCookieName,
              response.token,
              this.jwtHelper.getTokenExpirationDate(response.token),
              '/',
              environment.authCookieDomain,
            );
            localStorage.setItem(
              'real_user',
              JSON.stringify(this.jwtHelper.decodeToken(response.token).user),
            );
          }
          return response.success;*/
          //TODO
          return false;
        }),
      );
  }

  generateSecretUriAndQr(email: string): Observable<any> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/2fa/secret`,
        {
          email,
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  useRecoveryCode(code: string): Observable<boolean> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/2fa/useRecoveryCode`,
        { code },
        { withCredentials: true },
      )
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map((response) => {
          /*if (response) {
            this.cookieService.set(
              environment.authCookieName,
              response.token,
              this.jwtHelper.getTokenExpirationDate(response.token),
              '/',
              environment.authCookieDomain,
            );
            localStorage.setItem(
              'real_user',
              JSON.stringify(this.jwtHelper.decodeToken(response.token).user),
            );
            return response.recoveryCodesLeft;
          }*/
          //TODO
          return false;
        }),
      );
  }

  generateRecoveryCodes(): Observable<string[]> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/2fa/generateRecoveryCodes`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response.recoveryCodes;
        }),
      );
  }
}
