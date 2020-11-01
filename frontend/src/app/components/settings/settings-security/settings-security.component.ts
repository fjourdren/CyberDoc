import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';
import {MustMatch} from './_helpers/must-match.validator';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {TwoFactorServiceProvider} from 'src/app/services/twofactor/twofactor-service-provider';
import {PhoneNumberValidator} from '../../../pages/two-factor-register-page/phonenumber.validator';
import {SecurityCheckDialogComponent} from '../../security-check-dialog/security-check-dialog.component';

export interface DialogData {
    type: string;
    qr: string;
    phoneNumber: string;
    email: string;
    secret: string;
}

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

    // 2FA
    dialogConfig: any;
    phoneNumber: string;
    email: string;
    twoFactorApp: boolean;
    twoFactorSms: boolean;
    twoFactorEmail: boolean;

    constructor(private userServiceProvider: UserServiceProvider,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private fb: FormBuilder,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
        this.passwordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]]
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
        let refDialog: MatDialogRef<any>;
        switch (type) {
            case 'app':
                this.twoFactorServiceProvider.default().generateSecretUriAndQr(
                    this.userServiceProvider.default().getActiveUser().email).toPromise().then(res => {
                    refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
                        width: '500px',
                        data: {
                            type: 'app',
                            qr: res.qr,
                            secret: res.secret
                        }
                    });
                    refDialog.afterClosed().toPromise().then(() => {
                        this.refresh();
                    });
                });
                break;
            case 'sms':
                refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
                    width: '500px',
                    data: {
                        type: 'sms',
                        phoneNumber: this.phoneNumber
                    }
                });
                refDialog.afterClosed().toPromise().then(() => {
                    this.refresh();
                });
                break;
            case 'email':
                this.twoFactorServiceProvider.default().sendTokenByEmail(this.email).toPromise().then(() => {
                    refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
                        width: '500px',
                        data: {
                            type: 'email',
                            email: this.email
                        }
                    });
                    refDialog.afterClosed().toPromise().then(() => {
                        this.refresh();
                    });
                }).catch(err => this.snackBar.open('Email cannot be sent : ' + err.error.msg, null, {duration: 2500}));
                break;
        }
    }

    refresh(): void {
        this.email = this.userServiceProvider.default().getActiveUser().email;
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
        this.twoFactorEmail = this.userServiceProvider.default().getActiveUser().twoFactorEmail;
    }

    disableTwoFactor(type: string): void {
        switch (type) {
            case 'app':
                if (this.userServiceProvider.default().getActiveUser().twoFactorSms
                    || this.userServiceProvider.default().getActiveUser().twoFactorEmail) {
                    this.userServiceProvider.default().updateTwoFactor(
                        !this.userServiceProvider.default().getActiveUser().twoFactorApp,
                        this.userServiceProvider.default().getActiveUser().twoFactorSms,
                        this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                        this.userServiceProvider.default().getActiveUser().email
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
                        this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                        this.userServiceProvider.default().getActiveUser().email
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
            case 'email':
                if (this.userServiceProvider.default().getActiveUser().twoFactorApp
                    || this.userServiceProvider.default().getActiveUser().twoFactorSms) {
                    this.userServiceProvider.default().updateTwoFactor(
                        this.userServiceProvider.default().getActiveUser().twoFactorApp,
                        this.userServiceProvider.default().getActiveUser().twoFactorSms,
                        !this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                        this.userServiceProvider.default().getActiveUser().email
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

@Component({
    selector: 'app-settings-security-dialog',
    templateUrl: 'settings-security-dialog.component.html',
    styleUrls: ['./settings-security.component.scss']
})
export class SettingsSecurityDialogComponent implements OnInit {
    phoneNumberForm = new FormGroup({
        phoneNumber: new FormControl('', PhoneNumberValidator('FR'))
    });
    tokenForm: FormGroup;
    loading = false;

    constructor(private fb: FormBuilder,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                private snackBar: MatSnackBar,
                public dialogRef: MatDialogRef<SettingsSecurityDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    ngOnInit(): void {
        this.tokenForm = this.fb.group({
            token: [null, [Validators.required, Validators.pattern('[0-9]{6}')]]
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSubmitPhoneNumber(): void {
        this.loading = true;
        this.twoFactorServiceProvider.default().sendTokenBySms(this.phoneNumberForm.get('phoneNumber').value).toPromise().then(() => {
            this.loading = false;
            this.data.phoneNumber = this.phoneNumberForm.get('phoneNumber').value;
        }).catch(err => {
            this.loading = false;
            this.snackBar.open(err.error.msg, null, {duration: 2500});
        });
    }

    onSubmitToken(): void {
        this.loading = true;
        try {
            if (this.data.type === 'app') { // 2FA APP
                this.twoFactorServiceProvider.default()
                    .verifyTokenByApp(this.data.secret, this.tokenForm.get('token').value)
                    .toPromise().then(() => {
                    this.userServiceProvider.default().updateTwoFactor(
                        true,
                        this.userServiceProvider.default().getActiveUser().twoFactorSms,
                        this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                        this.userServiceProvider.default().getActiveUser().email
                    ).toPromise().then(() => {
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.loading = false;
                            this.snackBar.open('2FA activated', null, {duration: 2000});
                            this.dialogRef.close();
                        });
                    });
                    this.userServiceProvider.default().updateSecret(this.data.secret,
                        this.userServiceProvider.default().getActiveUser().email).toPromise();
                });
            } else if (this.data.type === 'sms') { // 2FA SMS
                this.twoFactorServiceProvider.default()
                    .verifyTokenBySms(this.data.phoneNumber, this.tokenForm.get('token').value)
                    .toPromise().then(() => {
                    this.userServiceProvider.default().updateTwoFactor(
                        this.userServiceProvider.default().getActiveUser().twoFactorApp,
                        true,
                        this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                        this.userServiceProvider.default().getActiveUser().email
                    ).toPromise().then(() => {
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.loading = false;
                            this.snackBar.open('2FA activated', null, {duration: 2000});
                            this.dialogRef.close();
                        }).catch(err => {
                            this.snackBar.open(err.msg, null, {duration: 1500});
                        });
                    });
                    this.userServiceProvider.default().updatePhoneNumber(this.data.phoneNumber,
                        this.userServiceProvider.default().getActiveUser().email).toPromise();

                });
            } else if (this.data.type === 'email') { // 2FA Email
                this.twoFactorServiceProvider.default()
                    .verifyTokenByEmail(this.userServiceProvider.default().getActiveUser().email, this.tokenForm.get('token').value)
                    .toPromise().then(() => {
                    this.userServiceProvider.default().updateTwoFactor(
                        this.userServiceProvider.default().getActiveUser().twoFactorApp,
                        this.userServiceProvider.default().getActiveUser().twoFactorSms,
                        true,
                        this.userServiceProvider.default().getActiveUser().email
                    ).toPromise().then(() => {
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.loading = false;
                            this.snackBar.open('2FA activated', null, {duration: 2000});
                            this.dialogRef.close();
                        });
                    });
                });
            }
        } catch (err) {
            this.loading = false;
            this.snackBar.open(err.error.msg, null, {duration: 2500});
        }
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }
}
