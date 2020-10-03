import { Component, Input } from '@angular/core';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { FilesUtilsService } from 'src/app/services/files-utils/files-utils.service';

@Component({
  selector: 'app-files-details-panel',
  templateUrl: './files-details-panel.component.html',
  styleUrls: ['./files-details-panel.component.scss']
})
export class FilesDetailsPanelComponent {

  @Input() node: CloudNode;

  constructor(private filesUtils: FilesUtilsService, private fsProvider: FileSystemProvider) { }

  getFilePreviewImageURL() {
    return this.fsProvider.default().getFilePreviewImageURL(this.node.id);
  }

  getIconForMimetype(mimetype: string) {
    const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
    return this.filesUtils.getFontAwesomeIcon(fileType);
  }

  getFileTypeFromMimetype(mimetype: string) {
    const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
    return this.filesUtils.fileTypeToString(fileType);
  }

}
