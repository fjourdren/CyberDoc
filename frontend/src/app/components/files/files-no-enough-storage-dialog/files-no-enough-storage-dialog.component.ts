import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-files-no-enough-storage-dialog',
  templateUrl: './files-no-enough-storage-dialog.component.html',
  styleUrls: ['./files-no-enough-storage-dialog.component.css'],
})
export class FilesNoEnoughStorageDialogComponent {
  readonly stripeDisabled = environment.disableStripe;

  constructor(
    public dialogRef: MatDialogRef<FilesNoEnoughStorageDialogComponent>,
  ) {}
}
