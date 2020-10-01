import { Component, Input } from '@angular/core';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { MimetypeUtilsService } from 'src/app/services/mimetype-utils/mimetype-utils.service';

@Component({
  selector: 'app-files-details-panel',
  templateUrl: './files-details-panel.component.html',
  styleUrls: ['./files-details-panel.component.scss']
})
export class FilesDetailsPanelComponent {

  @Input() node: CloudNode;

  constructor(private mimetypeUtils: MimetypeUtilsService, private fsProvider: FileSystemProvider) { }

  getFilePreviewImageURL() {
    return this.fsProvider.default().getFilePreviewImageURL(this.node.id);
  }

  getIconForMimetype(mimetype: string) {
    return this.mimetypeUtils.getFontAwesomeIconForMimetype(mimetype);
  }

  getFileTypeFromMimetype(mimetype: string) {
    return this.mimetypeUtils.getFileTypeForMimetype(mimetype);
  }

}
