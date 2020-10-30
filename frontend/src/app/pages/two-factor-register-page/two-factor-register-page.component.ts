import {Component, Inject, OnInit} from '@angular/core';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TwoFactorServiceProvider} from '../../services/twofactor/twofactor-service-provider';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PhoneNumberValidator} from "./phonenumber.validator";

export interface DialogData {
    type: string;
    qr: string;
    phoneNumber: string;
    email: string;
    secret: string;
}

@Component({
    selector: 'app-two-factor-register-page',
    templateUrl: './two-factor-register-page.component.html',
    styleUrls: ['./two-factor-register-page.component.scss']
})

export class TwoFactorRegisterPageComponent implements OnInit {
    // Dialog
    dialogConfig: any;
    phoneNumber: string;
    email: string;

    twoFactorApp: boolean;
    twoFactorSms: boolean;
    twoFactorEmail: boolean;

    loading = false;

    constructor(private userServiceProvider: UserServiceProvider,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
        this.twoFactorEmail = this.userServiceProvider.default().getActiveUser().twoFactorEmail;
        this.email = this.userServiceProvider.default().getActiveUser().email;

        this.dialogConfig = new MatDialogConfig();
    }

    // Dialogs
    openDialogActivateTwoFactor(type: string): void {
        let refDialog: MatDialogRef<any>;
        switch (type) {
            case 'app':
                this.twoFactorServiceProvider.default().generateSecretUriAndQr(
                    this.userServiceProvider.default().getActiveUser().email).toPromise().then(res => {
                    refDialog = this.dialog.open(TwoFactorRegisterDialogComponent, {
                        width: '500px',
                        data: {
                            type: 'app',
                            qr: res.qr,
                            secret: res.secret
                        }
                    });
                    refDialog.afterClosed().toPromise().then(() => {
                        this.refreshTwoFactor();
                    });
                });
                break;
            case 'sms':
                refDialog = this.dialog.open(TwoFactorRegisterDialogComponent, {
                    width: '500px',
                    data: {
                        type: 'sms'
                    }
                });
                refDialog.afterClosed().toPromise().then(() => {
                    this.refreshTwoFactor();
                });
                break;
            case 'email':
                this.twoFactorServiceProvider.default().sendTokenByEmail(this.email).toPromise().then(() => {
                    refDialog = this.dialog.open(TwoFactorRegisterDialogComponent, {
                        width: '500px',
                        data: {
                            type: 'email',
                            email: this.email
                        }
                    });
                    refDialog.afterClosed().toPromise().then(() => {
                        this.refreshTwoFactor();
                    });
                });
                break;
        }
    }

    refreshTwoFactor(): void {
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
        this.twoFactorEmail = this.userServiceProvider.default().getActiveUser().twoFactorEmail;
    }

    disableTwoFactor(type: string): void {
        this.loading = true;
        this.userServiceProvider.default().updateTwoFactor(
            type === 'app' ? !this.userServiceProvider.default().getActiveUser().twoFactorApp :
                this.userServiceProvider.default().getActiveUser().twoFactorApp,
            type === 'sms' ? !this.userServiceProvider.default().getActiveUser().twoFactorSms :
                this.userServiceProvider.default().getActiveUser().twoFactorSms,
            type === 'email' ? !this.userServiceProvider.default().getActiveUser().twoFactorEmail :
                this.userServiceProvider.default().getActiveUser().twoFactorEmail,
            this.userServiceProvider.default().getActiveUser().email
        ).toPromise().then(() => {
            this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                this.loading = false;
                this.refreshTwoFactor();
                this.snackBar.open('2FA disabled', null, {duration: 1500});
            }).catch(err => this.snackBar.open(err.msg, null, {duration: 1500}));
        });

    }
}

@Component({
    selector: 'app-two-factor-register-dialog',
    templateUrl: 'two-factor-register-dialog.component.html',
})
export class TwoFactorRegisterDialogComponent implements OnInit {
    phoneNumberForm = new FormGroup({
        phoneNumber: new FormControl('', PhoneNumberValidator('FR'))
    });
    tokenForm: FormGroup;
    loading = false;

    constructor(private fb: FormBuilder,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                private snackBar: MatSnackBar,
                public dialogRef: MatDialogRef<TwoFactorRegisterDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    get f(): { [p: string]: AbstractControl } {
        return this.tokenForm.controls;
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
        this.twoFactorServiceProvider.default().sendTokenBySms('+33' + this.phoneNumberForm.get('phoneNumber').value).toPromise().then(() => {
            this.loading = false;
            this.data.phoneNumber = this.phoneNumberForm.get('phoneNumber').value;
        }).catch(err => {
            this.loading = false;
            this.snackBar.open('SMS cannot be sent : ' + err.error.msg, null, {duration: 2500});
        });
    }

    onSubmitToken(): void {
        this.loading = true;
        try {
            if (this.data.type === 'app') { // 2FA APP
                this.twoFactorServiceProvider.default()
                    .verifyTokenByApp(this.data.secret, this.tokenForm.get('token').value)
                    .toPromise().then(res => {
                    if (res) {
                        this.userServiceProvider.default().updateTwoFactor(
                            true,
                            this.userServiceProvider.default().getActiveUser().twoFactorSms,
                            this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                            this.userServiceProvider.default().getActiveUser().email
                        ).toPromise().then(() => {
                            this.userServiceProvider.default().updateSecret(this.data.secret,
                                this.userServiceProvider.default().getActiveUser().email).toPromise().then(() => {
                                this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                                    this.loading = false;
                                    this.snackBar.open('2FA by app activated', null, {duration: 1500});
                                    this.dialogRef.close();
                                });
                            });
                        });
                    }
                }).catch(err => {
                    this.loading = false;
                    this.snackBar.open(err.error.msg, null, {duration: 2500});
                });
            } else if (this.data.type === 'sms') { // 2FA SMS
                this.twoFactorServiceProvider.default()
                    .verifyTokenBySms(this.data.phoneNumber, this.tokenForm.get('token').value)
                    .toPromise().then(res => {
                    if (res) {
                        this.userServiceProvider.default().updateTwoFactor(
                            this.userServiceProvider.default().getActiveUser().twoFactorApp,
                            true,
                            this.userServiceProvider.default().getActiveUser().twoFactorEmail,
                            this.userServiceProvider.default().getActiveUser().email
                        ).toPromise().then(() => {
                            this.userServiceProvider.default().updatePhoneNumber(this.data.phoneNumber,
                                this.userServiceProvider.default().getActiveUser().email).toPromise().then(() => {
                                this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                                    this.loading = false;
                                    this.snackBar.open('2FA by SMS activated', null, {duration: 1500});
                                    this.dialogRef.close();
                                });
                            });
                        });
                    }
                }).catch(err => {
                    this.loading = false;
                    this.snackBar.open(err.error.msg, null, {duration: 2500});
                });
            } else if (this.data.type === 'email') { // 2FA Email
                this.twoFactorServiceProvider.default()
                    .verifyTokenByEmail(this.userServiceProvider.default().getActiveUser().email, this.tokenForm.get('token').value)
                    .toPromise().then(res => {
                    if (res) {
                        this.userServiceProvider.default().updateTwoFactor(
                            this.userServiceProvider.default().getActiveUser().twoFactorApp,
                            this.userServiceProvider.default().getActiveUser().twoFactorSms,
                            true,
                            this.userServiceProvider.default().getActiveUser().email
                        ).toPromise().then(() => {
                            this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                                this.loading = false;
                                this.snackBar.open('2FA by email activated', null, {duration: 1500});
                                this.dialogRef.close();
                            });
                        });
                    }
                }).catch(err => {
                    this.loading = false;
                    this.snackBar.open(err.error.msg, null, {duration: 2500});
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
