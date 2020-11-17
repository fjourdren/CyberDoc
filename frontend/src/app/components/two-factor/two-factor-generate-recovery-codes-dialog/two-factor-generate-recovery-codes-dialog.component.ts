import {Component, Inject, OnInit} from '@angular/core';
import {TwoFactorServiceProvider} from '../../../services/twofactor/twofactor-service-provider';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserServiceProvider} from '../../../services/users/user-service-provider';

@Component({
    selector: 'app-two-factor-dialog',
    templateUrl: './two-factor-generate-recovery-codes-dialog.component.html',
    styleUrls: ['./two-factor-generate-recovery-codes-dialog.component.scss']
})

export class TwoFactorGenerateRecoveryCodesDialogComponent implements OnInit {
    generatedRecoveryCodes: string[];
    link: string;
    loading: boolean;

    constructor(private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                public dialogRef: MatDialogRef<TwoFactorGenerateRecoveryCodesDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data) {
    }

    ngOnInit(): void {
        // Generates 5 recovery codes
        this.twoFactorServiceProvider.default().generateRecoveryCodes(this.data.xAuthTokenArray).toPromise().then(codes => {
            this.generatedRecoveryCodes = codes;
            this.link = 'data:text/plain,';
            this.generatedRecoveryCodes.forEach(code => {
                this.link += code + '\n';
            });
        });
    }

    onCancelBtnClicked(): void {
        this.dialogRef.close();
    }

    downloadCodes(): void {
        this.loading = false;
        const anchor = document.createElement('a');
        anchor.download = `${this.userServiceProvider.default().getActiveUser().email}-recovery-codes_${new Date().getTime()}.txt`;
        anchor.href = this.link;
        anchor.click();
        anchor.remove();
    }
}
