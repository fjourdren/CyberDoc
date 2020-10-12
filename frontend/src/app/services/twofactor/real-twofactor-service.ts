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
    }

    add(email: string, phone_number: string, country_code: string): Observable<any> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/add`, {
            "email": email,
            "phone_number": phone_number,
            "country_code": country_code
        }).pipe(map(response => {
            return response.user.id;
        }));
    }

    delete(authy_id: string): Observable<void> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/delete`, {
            "authy_id": authy_id
        }).pipe(map(response => {
            return null;
        }));
    }

    qrCode(email: string, authy_id: string): Observable<void> {
        return this.httpClient.post<any>(`${this._baseUrl}/2fa/qrcode`, {
            "email": email,
            "authy_id": authy_id
        }).pipe(map(response => {
            return response.qrcode.qr_code;
        }));
    }
}