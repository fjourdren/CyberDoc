import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MustMatch } from './_helpers/must-match.validator';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TwoFactorServiceProvider } from 'src/app/services/twofactor/twofactor-service-provider';

export interface DialogData {
    type: string;
    qr: string;
    phoneNumber: string;
    email: string;
    secret: string;
}

export interface ConnectedDevices {
    id: number;
    name: string;
    lastConnexion: string;
    devices: string;
    OS: string;
}

export interface DialogDevicesData {
    name: string;
}

const DEVICES_DATA: ConnectedDevices[] = [
    { id: 1, name: "test", lastConnexion: '18-04-2020', devices: 'Iphone', OS: 'Ios 1.4.2' },
    { id: 2, name: "test2", lastConnexion: '21-05-2020', devices: 'Samsung', OS: ' Android 5.5' },
    { id: 3, name: "test3", lastConnexion: '27-10-2020', devices: 'PC', OS: 'Chrome' },
];

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

    twoFactorApp: boolean;
    twoFactorSms: boolean;
    twoFactorEmail: boolean;
    passwordStrength = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}';

    // Table
    displayedColumns: string[] = ['name', 'browser', 'OS', 'rename'];
    //dataSource: RespondShare[];
    dataSource = new MatTableDataSource([]);
    test = false;

    constructor(private userServiceProvider: UserServiceProvider,
        private twoFactorServiceProvider: TwoFactorServiceProvider,
        private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) {
        userServiceProvider.default().getUserDevices().toPromise().then((value) => {
            this.dataSource.data = value;
        });
        console.log(this.dataSource);
    }

    get f(): { [p: string]: AbstractControl } {
        return this.passwordForm.controls;
    }

    ngOnInit(): void {
        this.email = this.userServiceProvider.default().getActiveUser().email;
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

    onSubmitPassword(): void {
        console.warn(this.passwordForm.value);
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
                this.snackBar.open('Password updated', null, { duration: 1500 });
            }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
        } else {
            this.snackBar.open('Password aren\'t equals', null, { duration: 1500 });
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
                            this.refreshTwoFactor();
                        });
                    });
                break;
            case 'sms':
                refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
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
                    refDialog = this.dialog.open(SettingsSecurityDialogComponent, {
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

    // Dialogs Devices

    openDialogDevices(name: string): void {
        let refDialog: MatDialogRef<any>;
        refDialog = this.dialog.open(SettingsSecurityDevicesDialogComponent, {
            width: '500px',
            data: {
                'name': name
            }
        });
        refDialog.afterClosed().toPromise().then(() => {
            this.refreshTwoFactor();
        });


    }


    refreshTwoFactor(): void {
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
                            this.snackBar.open('2FA disabled', null, { duration: 1500 });
                            this.refreshTwoFactor();
                        }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
                    });
                } else {
                    this.snackBar.open('You have to keep at least one 2FA option to use the application.',
                        null, { duration: 1500 });
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
                            this.snackBar.open('2FA disabled', null, { duration: 1500 });
                            this.refreshTwoFactor();
                        }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
                    });
                } else {
                    this.snackBar.open('You have to keep at least one 2FA option to use the application.',
                        null, { duration: 1500 });
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
                            this.snackBar.open('2FA disabled', null, { duration: 1500 });
                            this.refreshTwoFactor();
                        }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
                    });
                } else {
                    this.snackBar.open('You have to keep at least one 2FA option to use the application.',
                        null, { duration: 1500 });
                }
                break;
        }
    }
}

@Component({
    selector: 'app-settings-security-dialog',
    templateUrl: 'settings-security-dialog.component.html',
})
export class SettingsSecurityDialogComponent implements OnInit {
    phoneNumberForm = new FormGroup({
        phoneNumber: new FormControl('')
    });
    tokenForm: FormGroup;
    phoneNumber: any;

    constructor(private fb: FormBuilder,
        private twoFactorServiceProvider: TwoFactorServiceProvider,
        private userServiceProvider: UserServiceProvider,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<SettingsSecurityDialogComponent>,
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
        this.phoneNumber = this.phoneNumberForm.get("phoneNumber").value;
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
                                this.snackBar.open('2FA activated', null, { duration: 1500 });
                                this.dialogRef.close();
                            }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
                        });
                        this.userServiceProvider.default().updateSecret(this.data.secret,
                            this.userServiceProvider.default().getActiveUser().email).toPromise();
                    }
                }).catch(err => {
                    this.snackBar.open(err.error.msg, null, { duration: 1500 });
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
                                this.snackBar.open('2FA activated', null, { duration: 1500 });
                                this.dialogRef.close();
                            }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
                        });
                        this.userServiceProvider.default().updatePhoneNumber(this.data.phoneNumber,
                            this.userServiceProvider.default().getActiveUser().email).toPromise();
                    }
                }).catch(err => {
                    this.snackBar.open(err.error.msg, null, { duration: 1500 });
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
                                this.snackBar.open('2FA activated', null, { duration: 1500 });
                                this.dialogRef.close();
                            }).catch(err => this.snackBar.open(err, null, { duration: 1500 }));
                        });
                    }
                }).catch(err => {
                    this.snackBar.open(err.error.msg, null, { duration: 1500 });
                });
        }
    }

    getNumber(obj): void {
        this.phoneNumber = obj; // [country_code][phone_number]
    }
}

@Component({
    selector: 'app-settings-security-devices-dialog',
    templateUrl: 'settings-security-devices-dialog.component.html',
})
export class SettingsSecurityDevicesDialogComponent {

    loading = false;
    input = new FormControl('', [Validators.required]);
    @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

    constructor(public dialogRef: MatDialogRef<SettingsSecurityDevicesDialogComponent>,
        private UserProvider: UserServiceProvider,
        @Inject(MAT_DIALOG_DATA) public data: DialogDevicesData) {
        this.input.setValue(this.data.name);
    }

    @HostListener("keydown", ['$event'])
    onKeyDown(evt: KeyboardEvent) {
        if (evt.key === "Enter") {
            this.onRenameBtnClicked();
        }
    }

    onRenameBtnClicked() {
        if (!this.input.value) { return; }

        this.loading = true;
        this.input.disable();
        this.dialogRef.disableClose = true;
        this.UserProvider.default().renameUserDevices(this.input.value).toPromise().then(() => {
            this.loading = false;
            this.input.enable();
            this.dialogRef.disableClose = false;
            this.dialogRef.close(true);
        })
    }

    onCancelBtnClicked() {
        this.dialogRef.close(false);
    }
}