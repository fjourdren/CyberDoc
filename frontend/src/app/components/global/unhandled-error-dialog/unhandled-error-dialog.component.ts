import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-unhandled-error-dialog',
  templateUrl: './unhandled-error-dialog.component.html',
  styleUrls: ['./unhandled-error-dialog.component.css'],
})
export class UnhandledErrorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UnhandledErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Error,
  ) {
    this.dialogRef.disableClose = true;
  }

  onRefreshBtn() {
    location.reload();
  }
}
