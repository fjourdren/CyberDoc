import { Observable } from 'rxjs';

export interface TwoFactorService {
    sendTokenBySms(phoneNumber: string): Observable<void>;
    verifyTokenByApp(secret: string, token: string): Observable<boolean>;
    verifyTokenBySms(phoneNumber: string, token: string): Observable<boolean>;
    sendTokenByEmail(email: string): Observable<void>;
    verifyTokenByEmail(email: string, token: string): Observable<boolean>;
    isTwoFactorSmsActivated(): Observable<boolean>;
    isTwoFactorEmailActivated(): Observable<boolean>;
    generateSecretUriAndQr(email: string): Observable<any>;
}
