import { Component, Input } from '@angular/core';
import { CloudFile, CloudNode, FileTag } from 'src/app/models/files-api-models';
import {
  FilesUtilsService,
  FileType,
} from 'src/app/services/files-utils/files-utils.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SettingsCreateEditTagDialogComponent } from '../../settings/settings-create-edit-tag-dialog/settings-create-edit-tag-dialog.component';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { UsersService } from 'src/app/services/users/users.service';
import { FilesPurgeDialogComponent } from '../files-purge-dialog/files-purge-dialog.component';

@Component({
  selector: 'app-files-details-panel',
  templateUrl: './files-details-panel.component.html',
  styleUrls: ['./files-details-panel.component.scss'],
})
export class FilesDetailsPanelComponent {
  @Input() loading: boolean;
  @Input() allTags: FileTag[];
  @Input() nodeTags: FileTag[];
  @Input() sharedWithMeMode: boolean;
  @Input() binMode: boolean;
  previewLoaded = false;
  previewError = false;

  constructor(
    private filesUtils: FilesUtilsService,
    private fsService: FileSystemService,
    private usersService: UsersService,
    private dialog: MatDialog,
  ) {
    this.refreshAllTags();
    this.usersService.userUpdated().subscribe(() => this.refreshAllTags());
  }

  private _node: CloudNode;

  get node(): CloudNode {
    return this._node;
  }

  @Input()
  set node(node: CloudNode) {
    this.previewLoaded = false;
    this.previewError = false;
    this._node = node;
    if (!node) {
      return;
    }

    this.nodeTags = node.tags;
  }

  onTagAdded(tag: FileTag): void {
    this.loading = true;
    this.fsService
      .addTag(this.node, tag)
      .toPromise()
      .then(() => {
        this.loading = false;
      });
  }

  onTagRemoved(tag: FileTag): void {
    this.loading = true;
    this.fsService
      .removeTag(this.node, tag)
      .toPromise()
      .then(() => {
        this.loading = false;
      });
  }

  refreshAllTags(): void {
    if (this.usersService.getActiveUser()) {
      this.allTags = this.usersService.getActiveUser().tags;
    } else {
      this.allTags = [];
    }
  }

  getFilePreviewImageURL(): string {
    return this.fsService.getFilePreviewImageURL(this.node);
  }

  getIconForMimetype(mimetype: string): any {
    const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
    return this.filesUtils.getFontAwesomeIcon(fileType);
  }

  getFileTypeFromMimetype(mimetype: string): string {
    const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
    return this.filesUtils.fileTypeToString(fileType);
  }

  createNewTag(tagName: string | undefined) {
    const dialogRef = this.dialog.open(SettingsCreateEditTagDialogComponent, {
      minWidth: '300px',
      maxWidth: '500px',
      data: tagName,
    });

    dialogRef
      .afterClosed()
      .toPromise()
      .then((tagName) => {
        for (const tag of this.allTags) {
          if (tag.name === tagName) {
            this.onTagAdded(tag);
          }
        }
      });
  }

  isPreviewAvailable(node: CloudNode) {
    if (node.isDirectory) return false;
    if (
      this.filesUtils.getFileTypeForMimetype(node.mimetype) == FileType.Unknown
    )
      return false;
    if (this.filesUtils.getFileTypeForMimetype(node.mimetype) == FileType.Audio)
      return false;
    return true;
  }

  onPreviewToggleChange(evt: MatSlideToggleChange) {
    this.loading = true;
    this.fsService
      .setPreviewEnabled(this.node as CloudFile, evt.checked)
      .toPromise()
      .then(() => {
        this.loading = false;
      });
  }
}
