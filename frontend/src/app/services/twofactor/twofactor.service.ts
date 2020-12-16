import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorService {
  private jwtHelper = new JwtHelperService();

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService,
  ) {}

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
        map((response) => {
          if (response.success) {
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
          return response.success;
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
        map((response) => {
          if (response.success) {
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
          return response.success;
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
        map((response) => {
          if (response) {
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
          }
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
