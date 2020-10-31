import { Component, Input } from '@angular/core';
import { CloudDirectory, CloudFile, CloudNode, FileTag } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { FilesUtilsService, FileType } from 'src/app/services/files-utils/files-utils.service';
import { MatDialog } from '@angular/material/dialog';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SettingsCreateEditTagDialogComponent } from '../../settings/settings-create-edit-tag-dialog/settings-create-edit-tag-dialog.component';

@Component({
    selector: 'app-files-details-panel',
    templateUrl: './files-details-panel.component.html',
    styleUrls: ['./files-details-panel.component.scss']
})
export class FilesDetailsPanelComponent {
    @Input() loading: boolean;
    @Input() allTags: FileTag[];
    @Input() nodeTags: FileTag[];
    @Input() sharedWithMeMode: boolean;

    constructor(
        private filesUtils: FilesUtilsService,
        private fsProvider: FileSystemProvider,
        private userServiceProvider: UserServiceProvider,
        private dialog: MatDialog) {
        this.refreshAllTags();
        this.userServiceProvider.default().userUpdated().subscribe(() => this.refreshAllTags());
    }

    private _node: CloudNode;

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

    createNewTag(tagName: string | undefined) {
        const dialogRef = this.dialog.open(SettingsCreateEditTagDialogComponent, {
            maxWidth: "400px",
            data: tagName
        })

        dialogRef.afterClosed().toPromise().then(tagName => {
            for (const tag of this.allTags) {
                if (tag.name === tagName) {
                    this.onTagAdded(tag);
                }
            }
        })
    }

    isPreviewAvailable(node: CloudNode) {
        if (node.isDirectory) return false;
        if (this.sharedWithMeMode) return false;
        if (this.filesUtils.getFileTypeForMimetype(node.mimetype) == FileType.Unknown) return false;
        return true;
    }

    onPreviewToggleChange(evt: MatSlideToggleChange) {
        this.loading = true;
        this.fsProvider.default().setPreviewEnabled(this.node as CloudFile, evt.checked).toPromise().then(() => {
            this.loading = false;
        });
    }
}
