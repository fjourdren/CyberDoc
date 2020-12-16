import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TwoFactorService } from 'src/app/services/twofactor/twofactor.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-two-factor-dialog',
  templateUrl: './two-factor-generate-recovery-codes-dialog.component.html',
  styleUrls: ['./two-factor-generate-recovery-codes-dialog.component.scss'],
})
export class TwoFactorGenerateRecoveryCodesDialogComponent implements OnInit {
  generatedRecoveryCodes: string[];
  link: string;
  loading: boolean;

  constructor(
    private twoFactorService: TwoFactorService,
    private usersService: UsersService,
    public dialogRef: MatDialogRef<TwoFactorGenerateRecoveryCodesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  ngOnInit(): void {
    // Generates 5 recovery codes
    this.twoFactorService
      .generateRecoveryCodes()
      .toPromise()
      .then((codes) => {
        this.generatedRecoveryCodes = codes;
        this.link = 'data:text/plain,';
        this.generatedRecoveryCodes.forEach((code) => {
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
    anchor.download = `${
      this.usersService.getActiveUser().email
    }-recovery-codes_${new Date().getTime()}.txt`;
    anchor.href = this.link;
    anchor.click();
    anchor.remove();
  }
}
