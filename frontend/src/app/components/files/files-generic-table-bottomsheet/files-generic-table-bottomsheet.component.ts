import { CloudNode } from 'src/app/models/files-api-models';
import {
  FilesUtilsService,
  FileType,
} from 'src/app/services/files-utils/files-utils.service';
import { Component, Inject, NgZone } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { UsersService } from 'src/app/services/users/users.service';

export interface FilesGenericTableBottomsheetData {
  sharedWithMeMode: boolean;
  callback: (action: string, extra?: string) => void;
  showDetailsEntry: boolean;
  readonlyMode: boolean;
  node: CloudNode;
  onBottomSheetClose: () => void;
}

@Component({
  selector: 'app-files-generic-table-bottomsheet',
  templateUrl: './files-generic-table-bottomsheet.component.html',
  styleUrls: ['./files-generic-table-bottomsheet.component.css'],
})
export class FilesGenericTableBottomsheetComponent {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<FilesGenericTableBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: FilesGenericTableBottomsheetData,
    private filesUtils: FilesUtilsService,
    private usersService: UsersService,
    private ngZone: NgZone,
  ) {
    this.bottomSheetRef
      .afterDismissed()
      .toPromise()
      .then(() => this.data.onBottomSheetClose());
  }

  node: CloudNode;

  getIconForMimetype(mimetype: string) {
    const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
    return this.filesUtils.getFontAwesomeIcon(fileType);
  }

  isCopyAvailable(node: CloudNode): boolean {
    return !this.data.readonlyMode && !node.isDirectory;
  }

  canBeOpened(node: CloudNode): boolean {
    return this.filesUtils.canBeOpenedInApp(
      this.filesUtils.getFileTypeForMimetype(node.mimetype),
    );
  }

  isPDFExportAvailable(node: CloudNode): boolean {
    const fileType = this.filesUtils.getFileTypeForMimetype(node.mimetype);
    return this.filesUtils.isPDFExportAvailable(fileType);
  }

  isEtherPadFile(node: CloudNode): boolean {
    return (
      this.filesUtils.getFileTypeForMimetype(node.mimetype) ===
      FileType.EtherPad
    );
  }

  onBottomSheetSelection(event: Event, action: string, extra?: string) {
    event.preventDefault();
    this.bottomSheetRef.dismiss();
    this.ngZone.run(() => {
      this.data.callback(action, extra);
      this.data.onBottomSheetClose();
    });
  }

  isOwner(): boolean {
    return this.usersService.getActiveUser().role === 'owner';
  }
}
