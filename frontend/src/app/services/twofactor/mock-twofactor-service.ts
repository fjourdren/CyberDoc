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
}
