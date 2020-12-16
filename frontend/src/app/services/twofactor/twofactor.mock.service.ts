/* eslint-disable @typescript-eslint/no-unused-vars */
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MockTwoFactorService {
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
