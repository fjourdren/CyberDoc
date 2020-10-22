import {Component, Input} from '@angular/core';
import {CloudNode, FileTag} from 'src/app/models/files-api-models';
import {FileSystemProvider} from 'src/app/services/filesystems/file-system-provider';
import {FilesUtilsService, FileType} from 'src/app/services/files-utils/files-utils.service';
import {FilesCreateTagDialogComponent} from '../files-create-tag-dialog/files-create-tag-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';

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

    get node(): CloudNode {
        return this._node;
    }

    @Input()
    set node(node: CloudNode) {
        this._node = node;
        if (!node) {
            return;
        }

        this.nodeTags = node.tags;
    }

    onTagAdded(tag: FileTag): void {
        this.loading = true;
        this.fsProvider.default().addTag(this.node, tag).toPromise().then(() => {
            this.loading = false;
        });
    }

    onTagRemoved(tag: FileTag): void {
        this.loading = true;
        this.fsProvider.default().removeTag(this.node, tag).toPromise().then(() => {
            this.loading = false;
        });
    }

    refreshAllTags(): void {
        if (this.userServiceProvider.default().getActiveUser()) {
            this.allTags = this.userServiceProvider.default().getActiveUser().tags;
        } else {
            this.allTags = [];
        }
    }

    getFilePreviewImageURL(): string {
        return this.fsProvider.default().getFilePreviewImageURL(this.node);
    }

    getIconForMimetype(mimetype: string): any {
        const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
        return this.filesUtils.getFontAwesomeIcon(fileType);
    }

    getFileTypeFromMimetype(mimetype: string): string {
        const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
        return this.filesUtils.fileTypeToString(fileType);
    }

    createNewTag(): void {
        this.dialog.open(FilesCreateTagDialogComponent, {
            maxWidth: '400px'
        });
    }

  onPreviewToogleChange(evt: MatSlideToggleChange){
    this.loading = true;
    this.fsProvider.default().setPreviewEnabled(this.node as CloudFile, evt.checked).toPromise().then(()=>{
      this.loading = false;
    });
  }

}
