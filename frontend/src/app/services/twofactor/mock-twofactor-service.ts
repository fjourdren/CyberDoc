/* eslint-disable @typescript-eslint/no-unused-vars */
import { TwoFactorService } from './twofactor-service';

import { Observable, of } from 'rxjs';

export class MockTwoFactorService implements TwoFactorService {
  sendTokenBySms(phoneNumber: string): Observable<void> {
    return of(null);
  }

  verifyTokenBySms(token: string): Observable<boolean> {
    return of(true);
  }

  verifyTokenByApp(secret: string, token: string): Observable<boolean> {
    return of(true);
  }

  generateSecretUriAndQr(): Observable<any> {
    return of(null);
  }

  useRecoveryCode(code: string): Observable<boolean> {
    return of(true);
  }

  generateRecoveryCodes(): Observable<string[]> {
    return of(['fake-code']);
  }
}
