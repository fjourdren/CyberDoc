import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-files-no-enough-storage-dialog',
  templateUrl: './files-no-enough-storage-dialog.component.html',
  styleUrls: ['./files-no-enough-storage-dialog.component.css'],
})
export class FilesNoEnoughStorageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FilesNoEnoughStorageDialogComponent>,
  ) {}
}
