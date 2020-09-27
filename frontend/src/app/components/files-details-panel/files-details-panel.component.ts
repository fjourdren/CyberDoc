import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';
import { MimetypeUtilsService } from 'src/app/services/mimetype-utils/mimetype-utils.service';

@Component({
  selector: 'app-files-details-panel',
  templateUrl: './files-details-panel.component.html',
  styleUrls: ['./files-details-panel.component.scss']
})
export class FilesDetailsPanelComponent {
  
  private _fileID: string;
  node$: Observable<CloudNode>;

  constructor(private mimetypeUtils: MimetypeUtilsService, private fsProvider: FileSystemProviderService) {
    this.fsProvider.default().refreshNeeded().subscribe(()=>this.refresh());
  }

  get fileID(): string {
    return this._fileID;
  }

  @Input()
  set fileID(val: string) {
    if (!val) return;

    this._fileID = val;
    this.refresh();
  }

  refresh(){
    this.node$ = this.fsProvider.default().get(this._fileID);
  }

  getFilePreviewImageURL(){
    return this.fsProvider.default().getFilePreviewImageURL(this.fileID);
  }

  getIconForMimetype(mimetype: string) {
    return this.mimetypeUtils.getFontAwesomeIconForMimetype(mimetype);
  }

  getFileTypeFromMimetype(mimetype: string) {
    return this.mimetypeUtils.getFileTypeForMimetype(mimetype);
  }

}
