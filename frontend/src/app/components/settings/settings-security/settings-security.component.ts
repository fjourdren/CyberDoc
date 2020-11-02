import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';
import {MustMatch} from './_helpers/must-match.validator';
import {SecurityCheckDialogComponent} from '../../security-check-dialog/security-check-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-settings-security',
    templateUrl: './settings-security.component.html',
    styleUrls: ['./settings-security.component.scss']
})
export class SettingsSecurityComponent {
    loading = false;

    // Password
    passwordForm: FormGroup;
    hidePassword1 = true;
    hidePassword2 = true;
    hidePassword3 = true;
    passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';

    // Passwords
    isTextFieldType: boolean;
    isTextFieldType2: boolean;

    constructor(private userServiceProvider: UserServiceProvider,
                private fb: FormBuilder,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
        this.passwordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            email: [this.userServiceProvider.default().getActiveUser().email, Validators.required]
        }, {
            validator: MustMatch('newPassword', 'newPasswordConfirmation')
        });
    }

    onSubmitPassword(): void {
        if (this.passwordForm.invalid) {
            return;
        }
        this.loading = true;
        this.dialog.open(SecurityCheckDialogComponent, {
            maxWidth: '500px'
        }).afterClosed().subscribe(isPasswordAndTwoFactorVerified => {
            if (isPasswordAndTwoFactorVerified) {
                this.userServiceProvider.default().updatePassword(
                    this.passwordForm.get('newPassword').value,
                    this.userServiceProvider.default().getActiveUser().email
                ).toPromise().then(() => {
                    this.loading = false;
                    this.snackBar.dismiss();
                    this.snackBar.open('Password updated', null, {duration: 1500});
                    this.passwordForm.reset();
                });
            }
        });
    }

    public checkError = (controlName: string, errorName: string) => {
        return this.passwordForm.controls[controlName].hasError(errorName);
    }
}
