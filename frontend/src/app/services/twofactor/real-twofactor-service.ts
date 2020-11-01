import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TwoFactorService} from './twofactor-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {CookieService} from 'ngx-cookie-service';
import { environment } from "src/environments/environment";

export class RealTwoFactorService implements TwoFactorService {
    private jwtHelper = new JwtHelperService();

    constructor(private httpClient: HttpClient, private cookieService: CookieService) {}

    sendTokenBySms(phoneNumber: string): Observable<any> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/2fa/send/sms`, {
            phoneNumber
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    sendTokenByEmail(email: string): Observable<any> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/2fa/send/email`, {
            email
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    verifyTokenBySms(phoneNumber: string, token: string): Observable<boolean> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/2fa/verify/token`, {
            phoneNumber,
            token
        }, {withCredentials: true}).pipe(map(response => {
            if (response.success) {
                this.cookieService.set(
                    environment.authCookieName,
                    response.token,
                    this.jwtHelper.getTokenExpirationDate(response.token),
                    '/',
                    environment.authCookieDomain);
                localStorage.setItem('real_user', JSON.stringify(this.jwtHelper.decodeToken(response.token).user));
            }
            return response.success;
        }));
    }

    verifyTokenByEmail(email: string, token: string): Observable<boolean> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/2fa/verify/token`, {
            email,
            token
        }, {withCredentials: true}).pipe(map(response => {
            if (response.success) {
                this.cookieService.set(
                    environment.authCookieName,
                    response.token,
                    this.jwtHelper.getTokenExpirationDate(response.token),
                    '/',
                    environment.authCookieDomain);
                localStorage.setItem('real_user', JSON.stringify(this.jwtHelper.decodeToken(response.token).user));
            }
            return response.success;
        }));
    }

    verifyTokenByApp(secret: string, token: string): Observable<boolean> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/2fa/verify/token`, {
            secret,
            token
        }, {withCredentials: true}).pipe(map(response => {
            if (response.success) {
                this.cookieService.set(
                    environment.authCookieName,
                    response.token,
                    this.jwtHelper.getTokenExpirationDate(response.token),
                    '/',
                    environment.authCookieDomain);
                localStorage.setItem('real_user', JSON.stringify(this.jwtHelper.decodeToken(response.token).user));
            }
            return response.success;
        }));
    }

    generateSecretUriAndQr(email: string): Observable<any> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/2fa/secret`, {
            email
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }
}
