import {Component, EventEmitter, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TwoFactorEditDialogComponent} from '../two-factor-edit-dialog/two-factor-edit-dialog.component';
import {UserServiceProvider} from '../../../services/users/user-service-provider';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SecurityCheckDialogComponent} from '../../security-check-dialog/security-check-dialog.component';

@Component({
    selector: 'app-two-factor-edit',
    templateUrl: './two-factor-edit.component.html',
    styleUrls: ['./two-factor-edit.component.css']
})
export class TwoFactorEditComponent {
    @Output() twoFactorAppEvent = new EventEmitter<boolean>();
    @Output() twoFactorSmsEvent = new EventEmitter<boolean>();
    twoFactorApp: boolean;
    twoFactorSms: boolean;

    constructor(private userServiceProvider: UserServiceProvider,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
        this.refresh();
    }

    refresh(): void {
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
        this.twoFactorAppEvent.emit(this.twoFactorApp);
        this.twoFactorSmsEvent.emit(this.twoFactorSms);
    }

    changeTwoFactorApp(event): void {
        if (this.twoFactorApp || this.twoFactorSms) {
            if (this.twoFactorApp) {
                if (this.twoFactorSms) { // 2FA by APP & 2FA by SMS are already activated
                    this.dialog.open(SecurityCheckDialogComponent, {
                        maxWidth: '500px'
                    }).afterClosed().subscribe(xAuthTokenArray => {
                        if (xAuthTokenArray && xAuthTokenArray.length === 3) { // password:appOrSms:2faToken
                            this.userServiceProvider.default().updateTwoFactor(
                                !this.userServiceProvider.default().getActiveUser().twoFactorApp,
                                this.userServiceProvider.default().getActiveUser().twoFactorSms,
                                undefined,
                                undefined,
                                xAuthTokenArray
                            ).toPromise().then(() => {
                                this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                                    this.snackBar.open('2FA by App disabled', null, {duration: 2000});
                                    this.refresh();
                                });
                            });
                        } else {
                            event.source.checked = true;
                        }
                    });
                } else { // Only 2FA by App is activated => Block user from removing it
                    event.source.checked = true;
                    this.snackBar.open('You have to keep at least one 2FA option to use CyberDoc',
                        null, {duration: 4000});
                }
            } else { // User wants to add 2FA by App (2FA by SMS is ON)
                event.source.checked = false;
                this.dialog.open(SecurityCheckDialogComponent, {
                    maxWidth: '500px'
                }).afterClosed().subscribe(xAuthTokenArray => {
                    if (xAuthTokenArray && xAuthTokenArray.length === 3) { // [password:smsOrApp:2faToken]
                        const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                            width: '500px',
                            data: {
                                twoFactorMode: 'app',
                                password: xAuthTokenArray[0],
                                token: xAuthTokenArray[2]
                            }
                        });

                        refDialog.afterClosed().toPromise().then(res => {
                            if (res) {
                                event.source.checked = true;
                            }
                            this.refresh();
                        });
                    }
                });
            }
        } else { // Neither 2FA APP or 2FA SMS are activated
            event.source.checked = false;
            const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: {
                    twoFactorMode: 'app',
                    password: null,
                    token: null
                }
            });

            refDialog.afterClosed().toPromise().then(res => {
                if (res) {
                    event.source.checked = true;
                }
                this.refresh();
            });
        }
    }

    changeTwoFactorSms(event): void {
        if (this.twoFactorSms || this.twoFactorApp) { // 2FA already used at least 1 time before
            if (this.twoFactorSms) {
                if (this.twoFactorApp) { // 2FA SMS & APP  already activated => Going to disable 2FA by SMS
                    this.dialog.open(SecurityCheckDialogComponent, {
                        maxWidth: '500px'
                    }).afterClosed().subscribe(xAuthTokenArray => {
                        if (xAuthTokenArray && xAuthTokenArray.length === 3) { // password:appOrSms:2faToken
                            this.userServiceProvider.default().updateTwoFactor(
                                this.userServiceProvider.default().getActiveUser().twoFactorApp,
                                !this.userServiceProvider.default().getActiveUser().twoFactorSms,
                                undefined,
                                undefined,
                                xAuthTokenArray
                            ).toPromise().then(() => {
                                this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                                    this.snackBar.open('2FA by SMS disabled', null, {duration: 2000});
                                    this.refresh();
                                });
                            });
                        } else {
                            event.source.checked = true;
                        }
                    });
                } else { // Only 2FA by SMS is activated
                    event.source.checked = true;
                    this.snackBar.open('You have to keep at least one 2FA option to use CyberDoc',
                        null, {duration: 4000});
                }
            } else { // User wants to activate 2FA by Sms (2FA by App already ON)
                event.source.checked = false;
                this.dialog.open(SecurityCheckDialogComponent, {
                    maxWidth: '500px'
                }).afterClosed().subscribe(xAuthTokenArray => {
                    if (xAuthTokenArray && xAuthTokenArray.length === 3) { // [password:smsOrApp:2faToken]
                        const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                            width: '500px',
                            data: {
                                twoFactorMode: 'sms',
                                password: xAuthTokenArray[0],
                                token: xAuthTokenArray[2]
                            }
                        });

                        refDialog.afterClosed().toPromise().then(res => {
                            if (res) {
                                event.source.checked = true;
                            }
                            this.refresh();
                        });
                    }
                });
            }
        } else { // First time registering 2FA (neither 2FA App or 2FA Sms are activated)
            event.source.checked = false;
            const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: {
                    twoFactorMode: 'sms',
                    password: null,
                    token: null
                }
            });

            refDialog.afterClosed().toPromise().then(res => {
                if (res) {
                    event.source.checked = true;
                }
                this.refresh();
            });
        }
    }
}
