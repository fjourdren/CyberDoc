import {Component, OnInit} from '@angular/core';
import {UserServiceProvider} from '../../services/users/user-service-provider';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { SettingsTwofaConfigureDialogComponent } from 'src/app/components/settings/settings-twofa-configure-dialog/settings-twofa-configure-dialog.component';

@Component({
    selector: 'app-two-factor-register-page',
    templateUrl: './two-factor-register-page.component.html',
    styleUrls: ['./two-factor-register-page.component.scss']
})

export class TwoFactorRegisterPageComponent implements OnInit {
    twoFactorApp: boolean;
    twoFactorSms: boolean;
    twoFactorEmail: boolean;
    loading = false;

    constructor(private userServiceProvider: UserServiceProvider,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.twoFactorApp = this.userServiceProvider.default().getActiveUser().twoFactorApp;
        this.twoFactorSms = this.userServiceProvider.default().getActiveUser().twoFactorSms;
        this.twoFactorEmail = this.userServiceProvider.default().getActiveUser().twoFactorEmail;
    }

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
                this.userServiceProvider.default().getActiveUser().twoFactorEmail
        ).toPromise().then(() => {
            this.userServiceProvider.default().refreshActiveUser().toPromise().then(() => {
                this.loading = false;
                this.refreshTwoFactor();
                this.snackBar.open('2FA disabled', null, {duration: 1500});
            }).catch(err => this.snackBar.open(err.msg, null, {duration: 1500}));
        });
    }
}