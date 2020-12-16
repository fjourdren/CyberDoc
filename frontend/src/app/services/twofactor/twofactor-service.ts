import { Observable } from 'rxjs';

export interface TwoFactorService {
  sendTokenBySms(phoneNumber: string): Observable<any>;

  verifyTokenByApp(
    secret: string | undefined,
    token: string,
  ): Observable<boolean>;
  verifyTokenBySms(
    phoneNumber: string | undefined,
    token: string,
  ): Observable<boolean>;
  generateSecretUriAndQr(email: string): Observable<any>;
  useRecoveryCode(code: string): Observable<boolean>;

  generateRecoveryCodes(): Observable<string[]>;
}
