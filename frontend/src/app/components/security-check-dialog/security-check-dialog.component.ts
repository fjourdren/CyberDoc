import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TwoFactorDialogComponent} from '../two-factor-dialog/two-factor-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';

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
                this.dialog.open(TwoFactorDialogComponent, {
                    maxWidth: '500px'
                }).afterClosed().subscribe(isTwoFactorVerified => {
                    if (isTwoFactorVerified) {
                        this.verifyPasswordDialog.close(true);
                    }
                });
            }
        }).catch(err => {
            this.snackBar.open(err.error.msg, null, {duration: 2500});
        });

    }
}
