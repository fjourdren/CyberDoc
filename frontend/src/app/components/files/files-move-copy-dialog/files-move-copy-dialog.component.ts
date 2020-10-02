import { Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CloudDirectory, CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { FilesTableRestrictions } from '../files-generic-table/files-table-restrictions';
import { MoveCopyDialogModel } from './move-copy-dialog-model';

@Component({
  selector: 'app-files-move-copy-dialog',
  templateUrl: './files-move-copy-dialog.component.html',
  styleUrls: ['./files-move-copy-dialog.component.css']
})
export class FilesMoveCopyDialogComponent {
  private _directoryID: string;
  loading = false;

  selectedNode: CloudNode;
  currentDirectory: CloudDirectory;
  filesTableRestrictions: FilesTableRestrictions;

  constructor(public dialogRef: MatDialogRef<FilesMoveCopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveCopyDialogModel,
    private fsProvider: FileSystemProvider,
    private translate: TranslateService) {
    this.directoryID = data.initialDirID;

    this.filesTableRestrictions = {
      isSelectable: (node: CloudNode) => node.isDirectory && node.id !== data.node.id,
      isReadOnly: (node: CloudNode) => true,
      isDisabled: (node: CloudNode) => !node.isDirectory || node.id === data.node.id,
      isContextAndBottomSheetDisabled: (node: CloudNode) => true
    }
  }

  get directoryID() {
    return this._directoryID;
  }

  set directoryID(val: string) {
    this._directoryID = val;

    this.loading = true;
    this.fsProvider.default().get(val).toPromise().then(node=>{
      if (node.isDirectory) {
        this.currentDirectory = node;
      }
      this.loading = false;
    })
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onMoveOrCopyBtnClicked();
    }
  }

  onBackBtnClicked() {
    this.directoryID = this.currentDirectory.path[this.currentDirectory.path.length - 1].id;
  }

  openButtonClicked(node: CloudNode) {
    if (node.isDirectory) {
      this.loading = true;
      this.fsProvider.default().get(node.id).toPromise().then(node=>{
        if (node.isDirectory) {
          this.currentDirectory = node;
        }
        this.loading = false;
      })
    }
  }


  onMoveOrCopyBtnClicked() {
    const oldRestrictions = this.filesTableRestrictions;
    this.filesTableRestrictions.isDisabled = (node: CloudNode) => true;

    let destID: string;
    if (this.selectedNode) {
      destID = this.selectedNode.id;
    } else {
      destID = this.directoryID;
    }


    this.loading = true;
    this.dialogRef.disableClose = true;
    if (this.data.copy) {
      this.translate.get("file.copy_new_name", { "filename": this.data.node.name }).toPromise().then(newName => {
        this.fsProvider.default().copy(this.data.node.id, newName, destID).toPromise().then(() => {
          this.loading = false;
          this.filesTableRestrictions = oldRestrictions;
          this.dialogRef.disableClose = false;
          this.dialogRef.close(true);
        })
      })
    } else {
      this.fsProvider.default().move(this.data.node.id, destID).toPromise().then(() => {
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
