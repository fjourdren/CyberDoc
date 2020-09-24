import { AfterViewInit, Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-rename-dialog',
  templateUrl: './files-rename-dialog.component.html',
  styleUrls: ['./files-rename-dialog.component.css']
})
export class FilesRenameDialogComponent implements AfterViewInit {

  loading = false;
  input = new FormControl('', [Validators.required]);
  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  constructor(public dialogRef: MatDialogRef<FilesRenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CloudNode,
    private fsProvider: FileSystemProviderService) {
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onRenameBtnClicked();
    }
  }

  ngAfterViewInit(): void {
    this.input.setValue(this.data.name);

    if (!this.data.isDirectory && this.data.name.indexOf(".") !== -1) {
      this.inputElement.nativeElement.setSelectionRange(0, this.data.name.lastIndexOf("."));
    } else {
      this.inputElement.nativeElement.setSelectionRange(0, this.data.name.length);
    }
  }

  onRenameBtnClicked() {
    this.loading = true;
    this.input.disable();
    this.dialogRef.disableClose = true;
    this.fsProvider.default().rename(this.data.id, this.input.value).toPromise().then(() => {
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
