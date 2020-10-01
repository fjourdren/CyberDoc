import { CloudNode } from 'src/app/models/files-api-models';
import { MimetypeUtilsService } from 'src/app/services/mimetype-utils/mimetype-utils.service';
import { Component, Inject, NgZone } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

export interface FilesGenericTableBottomsheetData {
  callback: (action: string) => void;
  showDetailsEntry: boolean;
  readonlyMode: boolean;
  node: CloudNode;
  onBottomSheetClose: () => void;
}

@Component({
  selector: 'app-files-generic-table-bottomsheet',
  templateUrl: './files-generic-table-bottomsheet.component.html',
  styleUrls: ['./files-generic-table-bottomsheet.component.css']
})
export class FilesGenericTableBottomsheetComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<FilesGenericTableBottomsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: FilesGenericTableBottomsheetData,
    private mimetypeUtils: MimetypeUtilsService,
    private ngZone: NgZone) {

    this.bottomSheetRef.afterDismissed().toPromise().then(() => this.data.onBottomSheetClose());
  }

  node: CloudNode;

  getIconForMimetype(mimetype: string) {
    return this.mimetypeUtils.getFontAwesomeIconForMimetype(mimetype);
  }

  onBottomSheetSelection(event: Event, action: string) {
    event.preventDefault();
    this.bottomSheetRef.dismiss();
    this.ngZone.run(() => {
      this.data.callback(action);
      this.data.onBottomSheetClose();
    })
  }
}
