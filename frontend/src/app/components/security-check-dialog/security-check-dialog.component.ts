import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
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
    loading = false;

    constructor(private snackBar: MatSnackBar,
                private fb: FormBuilder,
                private userServiceProvider: UserServiceProvider,
                private dialog: MatDialog,
                public verifyPasswordDialog: MatDialogRef<SecurityCheckDialogComponent>) {
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
        this.userServiceProvider.default().validatePassword(this.passwordForm.get('password').value).toPromise().then(isPasswordVerified => {
            if (isPasswordVerified) {
                this.dialog.open(TwoFactorCheckDialogComponent, {
                    maxWidth: '500px'
                }).afterClosed().subscribe(res => {
                    if (res.result) {
                        this.verifyPasswordDialog.close(res);
                        if (!res.recoveryCodesLeft) {
                            this.dialog.open(TwoFactorGenerateRecoveryCodesDialogComponent, {
                                maxWidth: '500px',
                                disableClose: true
                            });
                        }
                    }
                });
            }
        }).catch(err => {
            this.snackBar.open(err.error.msg, null, {duration: 2500});
        });

    }
}
