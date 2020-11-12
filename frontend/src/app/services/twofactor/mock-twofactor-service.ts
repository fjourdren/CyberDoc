import { TwoFactorService } from './twofactor-service';

import { Observable, of } from 'rxjs';
import { User } from 'src/app/models/users-api-models';
import { delay, map } from 'rxjs/operators';
import { EventEmitter } from '@angular/core';
import { FileTag } from 'src/app/models/files-api-models';
import { HttpErrorResponse } from '@angular/common/http';
import {TwoFactorRecoveryCode} from '../../models/two-factor-api-models';

export class MockTwoFactorService implements TwoFactorService {

    sendTokenBySms(phoneNumber: string): Observable<void> {
        return undefined;
    }

    verifyTokenBySms(phoneNumber: string, token: string): Observable<boolean> {
        return undefined;
    }

    verifyTokenByApp(secret: string, token: string): Observable<boolean> {
        return undefined;
    }

    generateSecretUriAndQr(): Observable<any> {
        return undefined;
    }

    useRecoveryCode(code: string): Observable<boolean> {
        return undefined;
    }

    generateRecoveryCodes(): Observable<string[]> {
        return undefined;
    }
}
