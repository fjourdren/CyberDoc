import { Component, Input } from '@angular/core';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { FilesUtilsService, FileType } from 'src/app/services/files-utils/files-utils.service';
import { FilesCreateTagDialogComponent } from '../files-create-tag-dialog/files-create-tag-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { FileTag } from 'src/app/models/users-api-models';

@Component({
  selector: 'app-files-details-panel',
  templateUrl: './files-details-panel.component.html',
  styleUrls: ['./files-details-panel.component.scss']
})
export class FilesDetailsPanelComponent {

  private _node: CloudNode;
  @Input() loading: boolean;
  @Input() allTags: FileTag[];
  @Input() nodeTags: FileTag[];

  constructor(
    private filesUtils: FilesUtilsService,
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider,
    private dialog: MatDialog) {

    this.refreshAllTags();
    this.userServiceProvider.default().userUpdated().subscribe(() => this.refreshAllTags());
  }

  get node() {
    return this._node;
  }

  @Input()
  set node(node: CloudNode) {
    this._node = node;
    if (!node) return;

    this.nodeTags = this.allTags.filter(tag => {
      return node.tagIDs.indexOf(tag.id) !== -1;
    });
  }

  onNodeTagsUpdated(val: FileTag[]) {
    this.fsProvider.default().editTags(this.node.id, val.map(tag => tag.id));
  }

  refreshAllTags() {
    this.allTags = this.userServiceProvider.default().getActiveUser().fileTags;
  }

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

  createNewTag() {
    this.dialog.open(FilesCreateTagDialogComponent, {
      maxWidth: "400px"
    })
  }

}
