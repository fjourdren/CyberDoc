import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';
import {MustMatch} from './_helpers/must-match.validator';
import {MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TwoFactorServiceProvider} from 'src/app/services/twofactor/twofactor-service-provider';
import {User} from '../../../models/users-api-models';

export interface DialogData {
    authy_id: string;
    qrCodeUrl: string;
    phoneNumber: string;
    email: string;
}

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

    // Dialog
    dialogConfig: any;
    phoneNumber: string;
    email: string;
    authyId: string;

    twoFactorApp: boolean;
    twoFactorSms: boolean;
    twoFactorEmail: boolean;

    constructor(private userServiceProvider: UserServiceProvider,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) {
    }

    passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';

    ngOnInit(): void {
        this.email = this.userServiceProvider.default().getActiveUser().email;
        this.phoneNumber = this.userServiceProvider.default().getActiveUser().phone_number;
        this.authyId = this.userServiceProvider.default().getActiveUser().authy_id;
        this.refreshTwoFactor();

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            newPasswordConfirmation: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordStrength)]],
            email: [this.email, Validators.required]
        }, {
            validator: MustMatch('newPassword', 'newPasswordConfirmation')
        });

        this.dialogConfig = new MatDialogConfig();
    }

    get f(): { [p: string]: AbstractControl } {
        return this.passwordForm.controls;
    }

    onSubmitPassword(): void {
        console.warn(this.passwordForm.value);
        if (this.passwordForm.get('oldPassword').value !== null && this.passwordForm.get('newPassword').value !== null
            && this.passwordForm.get('newPasswordConfirmation').value !== null) {
            this.updatePassword();
        }
    }

    updatePassword(): void {
        if (this.passwordForm.get('newPassword').value !== this.passwordForm.get('newPasswordConfirmation').value) {
            console.log('Passwords must match');
        } else {
            this.userServiceProvider.default().updatePassword(
                this.passwordForm.get('oldPassword').value,
                this.passwordForm.get('newPassword').value,
                this.userServiceProvider.default().getActiveUser().email
            ).toPromise().then(() => {
                this.snackBar.open('Password updated', null, {duration: 1500});
            }).catch(err => this.snackBar.open(err, null, {duration: 1500}));
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
        if (this.userServiceProvider.default().getActiveUser().authy_id == null) {
            this.snackBar.open('You must enter your phone number in your profile to enable 2FA', null, {duration: 3000});
        } else {
            switch (type) {
                case 'app':
                    this.twoFactorServiceProvider.default().generateQrCode(this.email, this.authyId).toPromise().then(res => {
                        const refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
                            width: '500px',
                            data: {
                                authy_id: this.authyId,
                                qrCodeUrl: res,
                                email: null,
                                phoneNumber: null
                            }
                        });
                        refDialog.afterClosed().toPromise().then(() => {
                            this.refreshTwoFactor();
                        });
                    });
                    break;
                case 'sms':
                    this.twoFactorServiceProvider.default().sendToken('sms', this.authyId).toPromise().then(() => {
                        const refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
                            width: '500px',
                            data: {
                                authy_id: this.authyId,
                                qrCodeUrl: null,
                                email: null,
                                phoneNumber: this.phoneNumber
                            }
                        });
                        refDialog.afterClosed().toPromise().then(() => {
                            this.refreshTwoFactor();
                        });
                    });
                    break;
                case 'email':
                    this.twoFactorServiceProvider.default().sendToken('email', this.authyId).toPromise().then(() => {
                        const refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
                            width: '500px',
                            data: {
                                authy_id: this.authyId,
                                qrCodeUrl: null,
                                email: this.email,
                                phoneNumber: null
                            }
                        });
                        refDialog.afterClosed().toPromise().then(() => {
                            this.refreshTwoFactor();
                        });
                    });
                    break;
            }
        }
    }

    refreshTwoFactor(): void {
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
        this.twoFactorEmail = this.userServiceProvider.default().getActiveUser().twoFactorEmail;
    }

    disableTwoFactor(type: string): void {
        this.userServiceProvider.default().updateTwoFactor(
            type === 'app' ?
                !this.userServiceProvider.default().getActiveUser().twoFactorApp : this.userServiceProvider.default().getActiveUser().twoFactorApp, // twoFactorApp
            type === 'sms' ? !this.userServiceProvider.default().getActiveUser().twoFactorSms : this.userServiceProvider.default().getActiveUser().twoFactorSms, // twoFactorSms
            type === 'email' ? !this.userServiceProvider.default().getActiveUser().twoFactorEmail : this.userServiceProvider.default().getActiveUser().twoFactorEmail, // twoFactorEmail
            this.userServiceProvider.default().getActiveUser().email
        ).toPromise().then(() => {
            this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                this.snackBar.open('2FA disabled', null, {duration: 1500});
                this.refreshTwoFactor();
            }).catch(err => this.snackBar.open(err, null, {duration: 1500}));
        });

    }
}

@Component({
    selector: 'app-settings-security-dialog',
    templateUrl: 'settings-security-dialog.component.html',
})
export class SettingsSecurityDialogComponent implements OnInit {
    tokenForm: FormGroup;
    twoFactorApp: boolean;
    twoFactorEmail: boolean;
    twoFactorSms: boolean;

    constructor(private fb: FormBuilder,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                private snackBar: MatSnackBar,
                public dialogRef: MatDialogRef<SettingsSecurityDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    ngOnInit(): void {
        this.tokenForm = this.fb.group({
            token: [null, [Validators.required, Validators.pattern('[0-9]{6,7}'), Validators.minLength(6), Validators.maxLength(7)]]
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSubmitToken(): void {
        this.twoFactorServiceProvider.default().verifyToken(this.data.authy_id, this.tokenForm.get('token').value).toPromise().then(res => {
            if (res) {
                this.userServiceProvider.default().updateTwoFactor(
                    this.data.qrCodeUrl ? true : this.userServiceProvider.default().getActiveUser().twoFactorApp,
                    this.data.phoneNumber ? true : this.userServiceProvider.default().getActiveUser().twoFactorSms,
                    this.data.email ? true : this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                    this.userServiceProvider.default().getActiveUser().email
                ).toPromise().then(() => {
                    this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                        this.snackBar.open('2FA activated', null, {duration: 1500});
                        this.dialogRef.close();
                    }).catch(err => this.snackBar.open(err, null, {duration: 1500}));
                });
            }
        }).catch(err => {
            this.snackBar.open(err.error.message, null, {duration: 1500});
        });
    }

    get f(): { [p: string]: AbstractControl } {
        return this.tokenForm.controls;
    }
}
