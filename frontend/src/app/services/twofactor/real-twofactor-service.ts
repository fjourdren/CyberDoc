import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TwoFactorService} from './twofactor-service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {CookieService} from 'ngx-cookie-service';

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
    }

    sendTokenBySms(phoneNumber: string): Observable<any> {
        let frenchPhoneNumber = '+33' + phoneNumber;
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/send/sms`, {
            phoneNumber: frenchPhoneNumber
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    sendTokenByEmail(email: string): Observable<any> {
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/send/email`, {
            email
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    verifyTokenBySms(phoneNumber: string, token: string): Observable<boolean> {
        let frenchPhoneNumber = '+33' + phoneNumber;
        return this.httpClient.post<any>(`${this.baseUrl}/2fa/verify/token`, {
            phoneNumber: frenchPhoneNumber,
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
