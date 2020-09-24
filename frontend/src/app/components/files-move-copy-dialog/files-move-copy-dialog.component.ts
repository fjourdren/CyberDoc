import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';
import { FilesTableRestrictions } from '../files-table/files-table-restrictions';
import { MoveCopyDialogModel } from './move-copy-dialog-model';

@Component({
  selector: 'app-files-move-copy-dialog',
  templateUrl: './files-move-copy-dialog.component.html',
  styleUrls: ['./files-move-copy-dialog.component.css']
})
export class FilesMoveCopyDialogComponent {
  directoryID: string;
  loading = false;

  filesTableRestrictions: FilesTableRestrictions;

  constructor(public dialogRef: MatDialogRef<FilesMoveCopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveCopyDialogModel,
    private fsProvider: FileSystemProviderService,
    private translate: TranslateService) {
    this.directoryID = data.initialDirID;

    this.filesTableRestrictions = {
      isSelectable: (node: CloudNode) => false,
      isReadOnly: (node: CloudNode) => true,
      isDisabled: (node: CloudNode) => !node.isDirectory || node.id === data.node.id,
      isContextAndBottomSheetDisabled: (node: CloudNode) => true
    }
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onMoveOrCopyBtnClicked();
    }
  }

  onMoveOrCopyBtnClicked() {
    const oldRestrictions = this.filesTableRestrictions;
    this.filesTableRestrictions.isDisabled = (node: CloudNode) => true;

    this.loading = true;
    this.dialogRef.disableClose = true;
    if (this.data.copy) {
      this.translate.get("file.copy_new_name", { "filename": this.data.node.name }).toPromise().then(newName => {
        this.fsProvider.default().copy(this.data.node.id, newName, this.directoryID).toPromise().then(() => {
          this.loading = false;
          this.filesTableRestrictions = oldRestrictions;
          this.dialogRef.disableClose = false;
          this.dialogRef.close(true);
        })
      })
    } else {
      this.fsProvider.default().move(this.data.node.id, this.directoryID).toPromise().then(() => {
        this.loading = false;
        this.filesTableRestrictions = oldRestrictions;
        this.dialogRef.disableClose = false;
        this.dialogRef.close(true);
      })
    }
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }
}
