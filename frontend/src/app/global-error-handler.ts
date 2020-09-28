import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    handleError(error) {
        console.error(error);
        if (environment.production) {
            history.pushState({}, null, `/error`);
        }
    }
}
