import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';
import {MustMatch} from './_helpers/must-match.validator';
import {MatDialog} from '@angular/material/dialog';
import { SettingsTwofaConfigureDialogComponent } from '../settings-twofa-configure-dialog/settings-twofa-configure-dialog.component';

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
    isTextFieldType3: boolean;

    // 2FA
    dialogConfig: any;
    phoneNumber: string;
    email: string;
    twoFactorApp: boolean;
    twoFactorSms: boolean;
    passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';

    constructor(private userServiceProvider: UserServiceProvider,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
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

        this.refresh();
        this.dialogConfig = new MatDialogConfig();
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

    // Dialogs
    openDialogActivateTwoFactor(type: string): void {
        const refDialog = this.dialog.open(SettingsTwofaConfigureDialogComponent, {
            width: "500px",
            data: type
        });

        refDialog.afterClosed().toPromise().then(() => {
            this.refreshTwoFactor();
        });
    }

    refresh(): void {
        this.email = this.userServiceProvider.default().getActiveUser().email;
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
    }

    disableTwoFactor(type: string): void {
        switch (type) {
            case 'app':
                if (this.userServiceProvider.default().getActiveUser().twoFactorSms
                    || this.userServiceProvider.default().getActiveUser().twoFactorEmail) {
                    this.userServiceProvider.default().updateTwoFactor(
                        !this.userServiceProvider.default().getActiveUser().twoFactorApp,
                        this.userServiceProvider.default().getActiveUser().twoFactorSms,
                    ).toPromise().then(() => {
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.snackBar.open('2FA disabled', null, {duration: 1500});
                            this.refresh();
                        }).catch(err => this.snackBar.open(err.msg, null, {duration: 1500}));
                    });
                } else {
                    this.snackBar.open('You have to keep at least one 2FA option to use the application.',
                        null, {duration: 1500});
                }
                break;
            case 'sms':
                if (this.userServiceProvider.default().getActiveUser().twoFactorApp
                    || this.userServiceProvider.default().getActiveUser().twoFactorEmail) {
                    this.userServiceProvider.default().updateTwoFactor(
                        this.userServiceProvider.default().getActiveUser().twoFactorApp,
                        !this.userServiceProvider.default().getActiveUser().twoFactorSms,
                    ).toPromise().then(() => {
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.snackBar.open('2FA disabled', null, {duration: 1500});
                            this.refresh();
                        }).catch(err => this.snackBar.open(err.msg, null, {duration: 1500}));
                    });
                } else {
                    this.snackBar.open('You have to keep at least one 2FA option to use the application.',
                        null, {duration: 1500});
                }
                break;
        }
    }
}
