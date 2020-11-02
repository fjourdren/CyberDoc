import {Component, EventEmitter, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TwoFactorEditDialogComponent} from '../two-factor-edit-dialog/two-factor-edit-dialog.component';
import {UserServiceProvider} from '../../../services/users/user-service-provider';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-two-factor-edit',
    templateUrl: './two-factor-edit.component.html',
    styleUrls: ['./two-factor-edit.component.css']
})
export class TwoFactorEditComponent {
    @Output() twoFactorAppEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() twoFactorSmsEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
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
        if (this.twoFactorApp) { // User wants to disable 2FA by App
            if (this.userServiceProvider.default().getActiveUser().twoFactorSms) {
                this.userServiceProvider.default().updateTwoFactor(
                    !this.userServiceProvider.default().getActiveUser().twoFactorApp,
                    this.userServiceProvider.default().getActiveUser().twoFactorSms,
                ).toPromise().then(() => {
                    this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                        this.snackBar.open('2FA by App disabled', null, {duration: 1500});
                        this.refresh();
                    }).catch(err => this.snackBar.open(err.msg, null, {duration: 2500}));
                });
            } else {
                event.source.checked = true;
                this.snackBar.open('You have to keep at least one 2FA option to use CyberDoc',
                    null, {duration: 1500});
            }
        } else {
            event.source.checked = false;
            const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: 'app'
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
        if (this.twoFactorSms) { // User wants to disable 2FA by SMS
            if (this.userServiceProvider.default().getActiveUser().twoFactorApp) {
                this.userServiceProvider.default().updateTwoFactor(
                    this.userServiceProvider.default().getActiveUser().twoFactorApp,
                    !this.userServiceProvider.default().getActiveUser().twoFactorSms,
                ).toPromise().then(() => {
                    this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                        this.snackBar.open('2FA by SMS disabled', null, {duration: 1500});
                        this.refresh();
                    }).catch(err => this.snackBar.open(err.msg, null, {duration: 2500}));
                });
            } else {
                event.source.checked = true;
                this.snackBar.open('You have to keep at least one 2FA option to use CyberDoc',
                    null, {duration: 1500});
            }
        } else {
            event.source.checked = false;
            const refDialog = this.dialog.open(TwoFactorEditDialogComponent, {
                width: '500px',
                data: 'sms'
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
