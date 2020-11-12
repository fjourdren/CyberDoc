import {Component} from '@angular/core';
import {TwoFactorServiceProvider} from '../../../services/twofactor/twofactor-service-provider';
import {MatDialogRef} from '@angular/material/dialog';
import {saveAs} from 'file-saver';

@Component({
    selector: 'app-two-factor-dialog',
    templateUrl: './two-factor-generate-recovery-codes-dialog.component.html',
    styleUrls: ['./two-factor-generate-recovery-codes-dialog.component.scss']
})

export class TwoFactorGenerateRecoveryCodesDialogComponent {
    generatedRecoveryCodes: string[];
    loading: any;

    constructor(private twoFactorServiceProvider: TwoFactorServiceProvider,
                public dialogRef: MatDialogRef<TwoFactorGenerateRecoveryCodesDialogComponent>) {
        // Generates 5 recovery codes
        twoFactorServiceProvider.default().generateRecoveryCodes().toPromise().then(res => {
            this.generatedRecoveryCodes = res;
        });
    }

    onCancelBtnClicked(): void {
        this.dialogRef.close();
    }

    downloadCodes(): void {
        let content = '';
        this.generatedRecoveryCodes.forEach(c => {
            content += c + '\n';
        });
        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, 'cyberdoc_' + new Date().getTime() + '.txt');
    }
}
