import { Observable } from 'rxjs';

export interface TwoFactorService {
    sendToken(sending_way: string, authy_id: string): Observable<void>;
    verifyToken(authy_id: string, token: string): Observable<boolean>;
    add(email: string, phone_number: string, country_code: string): Observable<string>;
    delete(authy_id: string): Observable<void>;
    generateQrCode(email: string, authy_id: string): Observable<string>;
    isTwoFactorAppActivated(): Observable<boolean>;
    isTwoFactorSmsActivated(): Observable<boolean>;
    isTwoFactorEmailActivated(): Observable<boolean>;
}