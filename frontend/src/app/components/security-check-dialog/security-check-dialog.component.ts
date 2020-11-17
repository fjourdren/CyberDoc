import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TwoFactorCheckDialogComponent} from '../two-factor/two-factor-check-dialog/two-factor-check-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TwoFactorGenerateRecoveryCodesDialogComponent} from '../two-factor/two-factor-generate-recovery-codes-dialog/two-factor-generate-recovery-codes-dialog.component';

@Component({
    selector: 'app-delete-account-password-dialog',
    templateUrl: 'security-check-dialog.component.html',
})
export class SecurityCheckDialogComponent implements OnInit {
    passwordForm: FormGroup;
    hidePassword = true;

    constructor(private snackBar: MatSnackBar,
                private fb: FormBuilder,
                private userServiceProvider: UserServiceProvider,
                private dialog: MatDialog,
                public verifyPasswordDialog: MatDialogRef<SecurityCheckDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data) {
    }

    ngOnInit(): void {
        this.passwordForm = this.fb.group({
            password: [null, Validators.required]
        });
    }

    onSubmitPassword(): void {
        if (this.passwordForm.invalid) {
            return;
        }
        const password: string = this.passwordForm.get('password').value;
        this.userServiceProvider.default().validatePassword(password).toPromise().then(isPasswordVerified => {
            if (isPasswordVerified) {
                const xAuthTokenArray = [password];
                if (this.data.checkTwoFactor) {
                    this.dialog.open(TwoFactorCheckDialogComponent, {
                        maxWidth: '500px'
                    }).afterClosed().subscribe(res => {
                        if (res.twoFactorTypeAndToken !== undefined) {
                            const twoFactorTypeAndTokenArray = res.twoFactorTypeAndToken.split('\t');
                            if (twoFactorTypeAndTokenArray[0]
                                && (twoFactorTypeAndTokenArray[0] === 'app' || twoFactorTypeAndTokenArray[0] === 'sms')) {
                                xAuthTokenArray.push(twoFactorTypeAndTokenArray[0]);
                            }
                            if (twoFactorTypeAndTokenArray[1] && twoFactorTypeAndTokenArray[1].length === 6) {
                                xAuthTokenArray.push(twoFactorTypeAndTokenArray[1]);
                            }
                        }
                        this.verifyPasswordDialog.close(xAuthTokenArray);
                        if (!res.recoveryCodesLeft) {
                            this.dialog.open(TwoFactorGenerateRecoveryCodesDialogComponent, {
                                maxWidth: '500px',
                                disableClose: true
                            });
                        }
                    });
                } else {
                    this.verifyPasswordDialog.close(xAuthTokenArray);
                }
            }
        }).catch(err => {
            this.snackBar.open(err.error.msg, null, {duration: 2500});
        });

    }
}
