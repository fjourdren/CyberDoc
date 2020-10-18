import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TwoFactorService} from './twofactor-service';

export class RealTwoFactorService implements TwoFactorService {
    // tslint:disable-next-line:variable-name
    private _baseUrl: string;

    constructor(private httpClient: HttpClient) {
        if (location.toString().indexOf('localhost') > -1) {
            this._baseUrl = 'http://localhost:3000/v1';
        } else {
            this._baseUrl = 'http://api.cyberdoc.fulgen.fr/v1';
        }
        console.log(this._baseUrl);
    }

    sendTokenBySms(phoneNumber: string): Observable<void> {
        console.log('sendTokenBySms(', phoneNumber, ')');
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/send/sms`, {
            phoneNumber
        }, {withCredentials: true}).pipe(map(() => {
            return null;
        }));
    }

    verifyTokenBySms(phoneNumber: string, token: string): Observable<boolean> {
        console.log('verifyTokenBySms(', phoneNumber, ', ', token, ')');
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/verify/token`, {
            phoneNumber,
            token
        }, {withCredentials: true}).pipe(map(response => {
            return response.valid;
        }));
    }

    sendTokenByEmail(email: string): Observable<void> {
        console.log('sendTokenByEmail(', email, ')');
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/send/email`, {
            email
        }, {withCredentials: true}).pipe(map(() => {
            return null;
        }));
    }

    verifyTokenByEmail(email: string, token: string): Observable<boolean> {
        console.log('verifyTokenByEmail(', email, ', ', token, ')');
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/verify/token`, {
            email,
            token
        }, {withCredentials: true}).pipe(map(response => {
            return response.valid;
        }));
    }

    isTwoFactorSmsActivated(): Observable<boolean> {
        return this.httpClient.get<any>(`${this._baseUrl}/2fa/status/sms`, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    isTwoFactorEmailActivated(): Observable<boolean> {
        return this.httpClient.get<any>(`${this._baseUrl}/2fa/status/email`, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }

    verifyTokenByApp(secret: string, token: string): Observable<boolean> {
        console.log('verifyTokenByApp(', secret, ', ', token, ')');
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/verify/token`, {
            secret,
            token
        }, {withCredentials: true}).pipe(map(response => {
            return response.success;
        }));
    }

    generateSecretUriAndQr(email: string): Observable<any> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/secret`, {
            email
        }, {withCredentials: true}).pipe(map(response => {
            return response;
        }));
    }
}
