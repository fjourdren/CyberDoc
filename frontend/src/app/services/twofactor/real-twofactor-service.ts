import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TwoFactorService } from './twofactor-service';

export class RealTwoFactorService implements TwoFactorService {
    private _baseUrl: string;

    constructor(private httpClient: HttpClient) {
        if (location.toString().indexOf("localhost") > -1){
            this._baseUrl = "http://localhost:3000/v1";
        } else {
            this._baseUrl = "http://api.cyberdoc.fulgen.fr/v1";
        }
        console.log(this._baseUrl);
    }

    sendToken(sending_way: string, authyId: string): Observable<void> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/send/${sending_way}`, {
            "authyId": authyId
        }, {withCredentials: true}).pipe(map(response => {
            return null;
        }));
    }

    add(email: string, phone_number: string, country_code: string): Observable<string> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/add`, {
            "email": email,
            "phone_number": phone_number,
            "country_code": country_code
        }, {withCredentials: true}).pipe(map(response => {
            return response.user.id;
        }));
    }

    delete(authyId: string): Observable<void> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/delete`, {
            "authyId": authyId
        }, {withCredentials: true}).pipe(map(response => {
            return null;
        }));
    }

    generateQrCode(email: string, authyId: string): Observable<string> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/qrcode`, {
            "email": email,
            "authyId": authyId
        }, {withCredentials: true}).pipe(map(response => {
            return response.qr_code;
        }));
    }

    verifyToken(authyId: string, token: string): Observable<boolean> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/verify/token`, {
            "authyId": authyId,
            "token": token
        }, {withCredentials: true}).pipe(map(response => {
            return response.success;
        }));
    }
    
    isTwoFactorAppActivated(): Observable<boolean> {
        return this.httpClient.get<any>(`${this._baseUrl}/2fa/status/app`, {withCredentials: true}).pipe(map(response => {
            return response;
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
}