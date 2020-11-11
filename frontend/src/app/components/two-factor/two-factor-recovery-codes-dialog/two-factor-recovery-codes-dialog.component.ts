import {Component} from '@angular/core';
import {TwoFactorServiceProvider} from '../../../services/twofactor/twofactor-service-provider';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-two-factor-dialog',
    templateUrl: './two-factor-recovery-codes-dialog.component.html',
    styleUrls: ['./two-factor-recovery-codes-dialog.component.scss']
})

export class TwoFactorRecoveryCodesDialogComponent {
    generatedRecoveryCodes: string[];
    loading: any;

    constructor(private twoFactorServiceProvider: TwoFactorServiceProvider,
                public dialogRef: MatDialogRef<TwoFactorRecoveryCodesDialogComponent>) {
        // Generates 5 recovery codes
        twoFactorServiceProvider.default().generateRecoveryCodes().toPromise().then(res => {
            this.generatedRecoveryCodes = res;
        });
    }

    onCancelBtnClicked(): void {
        this.dialogRef.close();
    }
}
