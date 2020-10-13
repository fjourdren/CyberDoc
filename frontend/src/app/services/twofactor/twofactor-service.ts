import { Observable } from 'rxjs';

export interface TwoFactorService {
    add(email: string, phone_number: string, country_code: string): Observable<any>;
    delete(authy_id: string): Observable<void>;
    qrCode(email: string, authy_id: string): Observable<any>;
}