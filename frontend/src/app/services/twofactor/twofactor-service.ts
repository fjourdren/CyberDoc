import { Observable } from 'rxjs';

export interface TwoFactorService {
    sendTokenBySms(phoneNumber: string): Observable<any>;
    verifyTokenByApp(token: string): Observable<boolean>;
    verifyTokenBySms(token: string): Observable<boolean>;
    generateSecretUriAndQr(email: string): Observable<any>;
}
