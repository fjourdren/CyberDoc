import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TwoFactorService} from './twofactor-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {CookieService} from 'ngx-cookie-service';
import {User} from '../../models/users-api-models';
import {EventEmitter} from '@angular/core';

const JWT_COOKIE_NAME = 'access_token';

export class RealTwoFactorService implements TwoFactorService {
    private jwtHelper = new JwtHelperService();
    private readonly baseUrl: string;
    private readonly cookieDomain: string;

    constructor(private httpClient: HttpClient, private cookieService: CookieService) {
        if (location.toString().indexOf('localhost') > -1) {
            this.baseUrl = 'http://localhost:3000/v1';
            this.cookieDomain = 'localhost';
        } else {
            this.baseUrl = 'http://api.cyberdoc.fulgen.fr/v1';
            this.cookieDomain = 'cyberdoc.fulgen.fr';
        }
        console.log(this.baseUrl);
    }

    sendTokenBySms(phoneNumber: string): Observable<any> {
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/send/sms`, {
            phoneNumber
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    verifyTokenBySms(phoneNumber: string, token: string): Observable<boolean> {
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/verify/token`, {
            phoneNumber,
            token
        }, {withCredentials: true}).pipe(map(response => {
            if (response.success) {
                this.cookieService.set(
                    JWT_COOKIE_NAME,
                    response.token,
                    this.jwtHelper.getTokenExpirationDate(response.token),
                    '/',
                    this.cookieDomain);
                localStorage.setItem('real_user', JSON.stringify(this.jwtHelper.decodeToken(response.token).user));
            }
            return response.success;
        }));
    }

    sendTokenByEmail(email: string): Observable<any> {
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/send/email`, {
            email
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    verifyTokenByEmail(email: string, token: string): Observable<boolean> {
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/verify/token`, {
            email,
            token
        }, {withCredentials: true}).pipe(map(response => {
            if (response.success) {
                this.cookieService.set(
                    JWT_COOKIE_NAME,
                    response.token,
                    this.jwtHelper.getTokenExpirationDate(response.token),
                    '/',
                    this.cookieDomain);
                localStorage.setItem('real_user', JSON.stringify(this.jwtHelper.decodeToken(response.token).user));
            }
            return response.success;
        }));
    }

    isTwoFactorSmsActivated(): Observable<boolean> {
        return this.httpClient.get<any>(`${this.baseUrl}/2fa/status/sms`, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    isTwoFactorEmailActivated(): Observable<boolean> {
        return this.httpClient.get<any>(`${this.baseUrl}/2fa/status/email`, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    verifyTokenByApp(secret: string, token: string): Observable<boolean> {
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/verify/token`, {
            secret,
            token
        }, {withCredentials: true}).pipe(map(response => {
            if (response.success) {
                this.cookieService.set(
                    JWT_COOKIE_NAME,
                    response.token,
                    this.jwtHelper.getTokenExpirationDate(response.token),
                    '/',
                    this.cookieDomain);
                localStorage.setItem('real_user', JSON.stringify(this.jwtHelper.decodeToken(response.token).user));
            }
            return response.success;
        }));
    }

    generateSecretUriAndQr(email: string): Observable<any> {
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/secret`, {
            email
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }
}
