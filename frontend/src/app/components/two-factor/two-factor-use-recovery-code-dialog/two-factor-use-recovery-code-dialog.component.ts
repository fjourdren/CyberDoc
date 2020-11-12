import {Component} from '@angular/core';
import {TwoFactorServiceProvider} from '../../../services/twofactor/twofactor-service-provider';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-two-factor-dialog',
    templateUrl: './two-factor-use-recovery-code-dialog.component.html',
    styleUrls: ['./two-factor-use-recovery-code-dialog.component.scss']
})

export class TwoFactorUseRecoveryCodeDialogComponent {
    recoverTwoFactorForm = new FormGroup({
        // UUID v4.0
        code: new FormControl('', [Validators.required, Validators.pattern(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)])
    });
    loading = false;

    constructor(private twoFactorServiceProvider: TwoFactorServiceProvider,
                private snackBar: MatSnackBar,
                public recoverTwoFactorDialog: MatDialogRef<TwoFactorUseRecoveryCodeDialogComponent>) {
    }

    onSubmit(): void {
        if (this.recoverTwoFactorForm.invalid) {
            return;
        }
        this.twoFactorServiceProvider.default().useRecoveryCode(this.recoverTwoFactorForm.get('code').value)
            .toPromise().then(recoveryCodesLeft => {
            this.loading = true;
            this.recoverTwoFactorDialog.close({
                result: true,
                recoveryCodesLeft
            });
        }).catch(err => {
            this.loading = false;
            this.snackBar.open(err.error.msg, null, {duration: 2500});
            this.recoverTwoFactorForm.controls.code.setErrors({incorrect: true});
        });
    }
}
