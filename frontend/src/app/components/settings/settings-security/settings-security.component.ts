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
    styleUrls: ['./settings-security.component.css']
})
export class SettingsSecurityComponent implements OnInit {
    // Forms
    passwordForm: FormGroup;

    // Passwords
    isTextFieldType: boolean;
    isTextFieldType2: boolean;
    isTextFieldType3: boolean;

    twoFactorApp: boolean;
    twoFactorSms: boolean;
    passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';

    constructor(private userServiceProvider: UserServiceProvider,
                private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.refreshTwoFactor();

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            email: [this.userServiceProvider.default().getActiveUser().email, Validators.required]
        }, {
            validator: MustMatch('newPassword', 'newPasswordConfirmation')
        });
    }

    onSubmitPassword(): void {
        if (this.passwordForm.get('oldPassword').value !== null && this.passwordForm.get('newPassword').value !== null
            && this.passwordForm.get('newPasswordConfirmation').value !== null) {
            this.updatePassword();
        }
    }

    updatePassword(): void {
        if (this.passwordForm.get('newPassword').value === this.passwordForm.get('newPasswordConfirmation').value) {
            this.userServiceProvider.default().updatePassword(
                this.passwordForm.get('oldPassword').value,
                this.passwordForm.get('newPassword').value,
                this.userServiceProvider.default().getActiveUser().email
            ).toPromise().then(() => {
                this.snackBar.open('Password updated', null, {duration: 1500});
            }).catch(err => this.snackBar.open(err.msg, null, {duration: 1500}));
        } else {
            this.snackBar.open('Password aren\'t equals', null, {duration: 1500});
        }
    }

    toggleOldPasswordFieldType(evt: Event): void {
        evt.preventDefault();
        this.isTextFieldType = !this.isTextFieldType;
    }

    toggleNewPasswordFieldType(evt: Event): void {
        evt.preventDefault();
        this.isTextFieldType2 = !this.isTextFieldType2;
    }

    toggleNewPasswordConfirmFieldType(evt: Event): void {
        evt.preventDefault();
        this.isTextFieldType3 = !this.isTextFieldType3;
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

    refreshTwoFactor(): void {
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
                            this.refreshTwoFactor();
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
                            this.refreshTwoFactor();
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