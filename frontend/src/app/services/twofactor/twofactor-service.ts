import { Observable } from 'rxjs';

export interface TwoFactorService {
    add(email: string, phone_number: string, country_code: string): Observable<string>;
    delete(authy_id: string): Observable<void>;
    qrCode(email: string, authy_id: string): Observable<string>;
    verifyToken(authy_id: string, token: string): Observable<boolean>;
    isTwoFactorAppActivated(): Observable<boolean>;
    isTwoFactorSmsActivated(): Observable<boolean>;
    isTwoFactorEmailActivated(): Observable<boolean>;
}