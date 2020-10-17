import { TwoFactorService } from './twofactor-service';

import { Observable, of } from 'rxjs';
import { User } from 'src/app/models/users-api-models';
import { delay, map } from 'rxjs/operators';
import { EventEmitter } from '@angular/core';
import { FileTag } from 'src/app/models/files-api-models';
import { HttpErrorResponse } from '@angular/common/http';

const DELAY = 500;

export class MockTwoFactorService implements TwoFactorService {
    constructor() {
        
    }
    sendToken(sending_way: string, authyId: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return null
        }));
    }

    verifyToken(authyId: string, token: string): Observable<boolean> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return true;
        }));
    }

    add(email: string, phone_number: string, country_code: string): Observable<any> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
        }));
    }

    delete(authyId: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
        }));
    }

    generateQrCode(email: string, authyId: string): Observable<string> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return "https://upload.wikimedia.org/wikipedia/commons/7/78/Qrcode_wikipedia_fr_v2clean.png";
        }));
    }

    isTwoFactorAppActivated(): Observable<boolean> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return true;
        }));
    }
    isTwoFactorSmsActivated(): Observable<boolean> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return true;
        }));
    }
    isTwoFactorEmailActivated(): Observable<boolean> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return true;
        }));
    }
}
