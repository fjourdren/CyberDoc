import { Observable } from 'rxjs';
import {TwoFactorRecoveryCode} from '../../models/two-factor-api-models';

export interface TwoFactorService {
    sendTokenBySms(phoneNumber: string): Observable<any>;
    verifyTokenByApp(secret: string, token: string): Observable<boolean>;
    verifyTokenBySms(phoneNumber: string, token: string): Observable<boolean>;
    generateSecretUriAndQr(email: string): Observable<any>;
    verifyRecoveryCode(code: string): Observable<void>;
    generateRecoveryCodes(): Observable<string[]>;
}
