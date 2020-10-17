import { Observable } from 'rxjs';

export interface TwoFactorService {
    sendToken(sending_way: string, authyId: string): Observable<void>;
    verifyToken(authyId: string, token: string): Observable<boolean>;
    add(email: string, phone_number: string, country_code: string): Observable<string>;
    delete(authyId: string): Observable<void>;
    generateQrCode(email: string, authyId: string): Observable<string>;
    isTwoFactorAppActivated(): Observable<boolean>;
    isTwoFactorSmsActivated(): Observable<boolean>;
    isTwoFactorEmailActivated(): Observable<boolean>;
}