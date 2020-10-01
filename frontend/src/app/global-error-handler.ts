import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnhandledErrorDialogComponent } from './components/global/unhandled-error-dialog/unhandled-error-dialog.component';

let handleErrorCalled = false;

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private injector: Injector, private ngzone: NgZone) { }

    handleError(error) {
        console.error(error);

        if (!handleErrorCalled){
            handleErrorCalled = true;
            this.ngzone.run(() => {
                const dialog: MatDialog = this.injector.get(MatDialog);
                dialog.open(UnhandledErrorDialogComponent, {
                    data: error
                })
            });
        }
    }
}
