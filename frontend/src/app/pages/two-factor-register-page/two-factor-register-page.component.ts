import {Component, Inject, OnInit} from '@angular/core';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TwoFactorServiceProvider} from '../../services/twofactor/twofactor-service-provider';
import {MatSnackBar} from '@angular/material/snack-bar';

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
    loading: boolean;

    // Dialog
    dialogConfig: any;
    phoneNumber: string;
    email: string;

    twoFactorApp: boolean;
    twoFactorSms: boolean;
    twoFactorEmail: boolean;

    constructor(private userServiceProvider: UserServiceProvider,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private snackBar: MatSnackBar,
                private dialog: MatDialog,
                private router: Router) {
    }

    ngOnInit(): void {
        this.loading = false;
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
        this.twoFactorEmail = this.userServiceProvider.default().getActiveUser().twoFactorEmail;

        this.dialogConfig = new MatDialogConfig();
    }

    goToApp(): void {
        if (!this.twoFactorApp && !this.twoFactorEmail && !this.twoFactorSms) {
            return;
        }
        this.loading = true;
        this.router.navigate(['/files']);
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
                this.snackBar.open('2FA disabled', null, {duration: 1500});
                this.refreshTwoFactor();
            }).catch(err => this.snackBar.open(err, null, {duration: 1500}));
        });

    }

    disconnect(): void {
        this.router.navigate(['/logout']);
    }
}

@Component({
    selector: 'app-two-factor-register-dialog',
    templateUrl: 'two-factor-register-dialog.component.html',
})
export class TwoFactorRegisterDialogComponent implements OnInit {
    phoneNumberForm = new FormGroup({
        phoneNumber: new FormControl('')
    });
    tokenForm: FormGroup;
    phoneNumber: any;

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
            token: [null, [Validators.required, Validators.pattern('[0-9]{6,7}'), Validators.minLength(6), Validators.maxLength(7)]]
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSubmitPhoneNumber(): void {
        this.twoFactorServiceProvider.default().sendTokenBySms(this.phoneNumber).toPromise().then(() => {
            this.data.phoneNumber = this.phoneNumber;
        });
    }

    onSubmitToken(): void {
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
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.snackBar.open('2FA activated', null, {duration: 1500});
                            this.dialogRef.close();
                        }).catch(err => this.snackBar.open(err, null, {duration: 1500}));
                    });
                    console.log('Secret:', this.data.secret, '/email:',
                        this.userServiceProvider.default().getActiveUser().email);
                    this.userServiceProvider.default().updateSecret(this.data.secret,
                        this.userServiceProvider.default().getActiveUser().email);
                }
            }).catch(err => {
                this.snackBar.open(err.error.message, null, {duration: 1500});
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
                        this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                            this.snackBar.open('2FA activated', null, {duration: 1500});
                            this.dialogRef.close();
                        }).catch(err => this.snackBar.open(err, null, {duration: 1500}));
                    });
                    this.userServiceProvider.default().updatePhoneNumber(this.data.phoneNumber,
                        this.userServiceProvider.default().getActiveUser().email);
                }
            }).catch(err => {
                this.snackBar.open(err.error.message, null, {duration: 1500});
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
                            this.snackBar.open('2FA activated', null, {duration: 1500});
                            this.dialogRef.close();
                        }).catch(err => this.snackBar.open(err, null, {duration: 1500}));
                    });
                }
            }).catch(err => {
                this.snackBar.open(err.error.message, null, {duration: 1500});
            });
        }
    }

    getNumber(obj): void {
        this.phoneNumber = obj; // [country_code][phone_number]
    }
}
