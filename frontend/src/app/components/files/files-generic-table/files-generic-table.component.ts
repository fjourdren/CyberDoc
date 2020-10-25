import {AfterViewInit, Component, EventEmitter, Input, NgZone, Output, ViewChild} from '@angular/core';

import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatMenuTrigger} from '@angular/material/menu';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatDialog} from '@angular/material/dialog';

import {NgResizeObserver, ngResizeObserverProviders} from 'ng-resize-observer';
import {map} from 'rxjs/operators';

import {FilesTableRestrictions, NO_RESTRICTIONS} from './files-table-restrictions';
import {CloudFile, CloudNode} from 'src/app/models/files-api-models';
import {FilesDeleteDialogComponent} from '../files-delete-dialog/files-delete-dialog.component';
import {FilesMoveCopyDialogComponent} from '../files-move-copy-dialog/files-move-copy-dialog.component';
import {MoveCopyDialogModel} from '../files-move-copy-dialog/move-copy-dialog-model';
import {FilesUtilsService} from 'src/app/services/files-utils/files-utils.service';
import {
    FilesGenericTableBottomsheetComponent,
    FilesGenericTableBottomsheetData
} from '../files-generic-table-bottomsheet/files-generic-table-bottomsheet.component';
import {FilesRenameDialogComponent} from '../files-rename-dialog/files-rename-dialog.component';
import {FileSystemProvider} from 'src/app/services/filesystems/file-system-provider';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';
import { FilesShareMenuDialogComponent } from '../files-share-menu-dialog/files-share-menu-dialog.component';

export type FileAction = 'open' | 'download' | 'export' | 'rename' | 'copy' | 'delete' | 'move' | 'details' | 'share';

@Component({
    selector: 'app-files-generic-table',
    templateUrl: './files-generic-table.component.html',
    styleUrls: ['./files-generic-table.component.scss'],
    providers: [...ngResizeObserverProviders]
})
export class FilesGenericTableComponent implements AfterViewInit {

    isTouchScreen = 'ontouchstart'
    in
    window;
    unselectAfterContextMenuOrBottomSheet = false;
    private _touchStartEventTrigerred = false;

    displayedColumns = ['icon', 'name', 'type', 'size', 'date', 'menubutton'];
    dataSource = new MatTableDataSource([]);
    contextMenuPosition = {x: '0px', y: '0px'};
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

    @Input() currentDirectoryID: string | null;
    @Input() showDetailsButton: boolean;
    @Output() selectedNodeChange = new EventEmitter<CloudNode>();
    @Output() openButtonClicked = new EventEmitter<CloudNode>();
    @Output() detailsButtonClicked = new EventEmitter<CloudNode>();

    private _selectedNode: CloudNode | null;
    private _restrictions: FilesTableRestrictions = NO_RESTRICTIONS;

    get selectedNode(): CloudNode {
        return this._selectedNode;
    }

    @Input()
    set selectedNode(val: CloudNode) {
        if (val && !this._restrictions.isSelectable(val)) {
            return;
        }
        this._selectedNode = val;
    }

    get items(): CloudNode[] {
        return this.dataSource.data;
    }

    @Input()
    set items(val: CloudNode[]) {
        if (!val) {
            this.dataSource.data = [];
        } else {
            this.dataSource.data = val;
        }
    }

    get restrictions(): FilesTableRestrictions {
        return this._restrictions;
    }

    @Input()
    set restrictions(val: FilesTableRestrictions) {
        if (val) {
            this._restrictions = val;
        } else {
            this._restrictions = NO_RESTRICTIONS;
        }
    }

    constructor(
        private bottomSheet: MatBottomSheet,
        private dialog: MatDialog,
        private ngZone: NgZone,
        private filesUtils: FilesUtilsService,
        private resize: NgResizeObserver,
        private fsProvider: FileSystemProvider,
        private userServiceProvider: UserServiceProvider
    ) {
        resize.pipe(map(entry => entry.contentRect.width)).subscribe(this.onTableWidthChanged.bind(this));
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.contextMenu.menuClosed.subscribe(() => {
            if (this.unselectAfterContextMenuOrBottomSheet) {
                this.setSelectedNode(null);
                this.unselectAfterContextMenuOrBottomSheet = false;
            }
        });
    }

    setSelectedNode(node: CloudNode): void {
        if (node && !this._restrictions.isSelectable(node)) {
            return;
        }
        this.selectedNode = node;
        this.selectedNodeChange.emit(node);
    }

    isCopyAvailable(node: CloudNode): boolean {
        return !this.isReadOnly(node) && !node.isDirectory;
    }

    isPDFExportAvailable(node: CloudNode): boolean {
        if (!node) {
            return;
        }

        const fileType = this.filesUtils.getFileTypeForMimetype(node.mimetype);
        return this.filesUtils.isPDFExportAvailable(fileType);
    }

    getIconForMimetype(mimetype: string): string {
        const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
        return this.filesUtils.getFontAwesomeIcon(fileType);
    }

    getFileTypeFromMimetype(mimetype: string): string {
        const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
        return this.filesUtils.fileTypeToString(fileType);
    }

    isReadOnly(node: CloudNode): boolean {
        return this.restrictions.isReadOnly(node) || node && node.name === '..';
    }

    onContextMenu(event: MouseEvent, node: CloudNode): void {
        if (this._restrictions.isContextAndBottomSheetDisabled(node)) {
            return;
        }

        event.preventDefault();
        this.setSelectedNode(node);
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = {item: node};
        this.contextMenu.menu.focusFirstItem('mouse');
        this.unselectAfterContextMenuOrBottomSheet = true;
        this.contextMenu.openMenu();
    }
  
    openBottomSheet(node: CloudNode): void {
        if (this._restrictions.isContextAndBottomSheetDisabled(node)) {
            return;
        }

        this.setSelectedNode(node);
        this.unselectAfterContextMenuOrBottomSheet = true;
        this.bottomSheet.open(FilesGenericTableBottomsheetComponent, {
            data: {
                callback: this.onContextMenuOrBottomSheetSelection.bind(this),
                readonlyMode: this.isReadOnly(node),
                showDetailsEntry: this.showDetailsButton,
                node,
                onBottomSheetClose: this.onBottomSheetClose.bind(this)
            } as FilesGenericTableBottomsheetData
        });
    }

    onContextMenuOrBottomSheetSelection(action: FileAction): void {
        this.ngZone.run(() => {
            this.execActionOnSelectedNode(action);
        });
    }

    onBottomSheetClose(): void {
        if (this.unselectAfterContextMenuOrBottomSheet) {
            this.setSelectedNode(null);
            this.unselectAfterContextMenuOrBottomSheet = false;
        }
    }

    onTouchStart(node: CloudNode): void {
        this.ngZone.run(() => {
            this.isTouchScreen = true;
            this._touchStartEventTrigerred = true;
            this.setSelectedNode(node);
            this.execActionOnSelectedNode('open');
        });
    }

    onClick(node: CloudNode): void {
        this.ngZone.run(() => {
            if (this._touchStartEventTrigerred) {
                this._touchStartEventTrigerred = false;
                return;
            }

            this.isTouchScreen = false;
            if (this.selectedNode && this.selectedNode === node) {
                this.setSelectedNode(null);
            } else if (this._restrictions.isSelectable(node)) {
                this.setSelectedNode(node);
            }
        });
    }

    onDoubleClick(node: CloudNode): void {
        this.ngZone.run(() => {
            this.setSelectedNode(node);
            this.execActionOnSelectedNode('open');
        });
    }

    onTableWidthChanged(width: number): void {
        if (width < 500) {
            this.displayedColumns = ['icon', 'name', 'menubutton'];
        } else if (width < 600) {
            this.displayedColumns = ['icon', 'name', 'date', 'menubutton'];
        } else if (width < 700) {
            this.displayedColumns = ['icon', 'name', 'size', 'date', 'menubutton'];
        } else {
            this.displayedColumns = ['icon', 'name', 'type', 'size', 'date', 'menubutton'];
        }
    }

    execActionOnSelectedNode(action: FileAction): void {
        switch (action) {
            case 'open': {
                this.openButtonClicked.emit(this.selectedNode);
                break;
            }
            case 'download': {
                this.downloadFile(this.selectedNode as CloudFile);
                break;
            }
            case 'export': {
                this.exportFile(this.selectedNode as CloudFile);
                break;
            }
            case 'details': {
                this.unselectAfterContextMenuOrBottomSheet = false;
                this.detailsButtonClicked.emit(this.selectedNode);
                break;
            }
            case 'delete': {
                this.deleteNode(this.selectedNode);
                break;
            }
            case 'rename': {
                this.renameNode(this.selectedNode);
                break;
            }
            case 'move': {
                this.moveOrCopyNode(this.selectedNode, false);
                break;
            }
            case 'copy': {
                this.moveOrCopyNode(this.selectedNode, true);
                break;
            }
            case 'share': {
                this.shareNode(this.selectedNode);
                break;
            }
        }
    }

    deleteNode(node: CloudNode): void {
        this.dialog.open(FilesDeleteDialogComponent, {
            maxWidth: '400px',
            data: node
        });
    }

    renameNode(node: CloudNode): void {
        this.dialog.open(FilesRenameDialogComponent, {
            maxWidth: '400px',
            data: node
        });
    }

    moveOrCopyNode(node: CloudNode, isCopy: boolean): void {
        const initialDirectoryID = this.currentDirectoryID || this.userServiceProvider.default().getActiveUser().directory_id;
        this.dialog.open(FilesMoveCopyDialogComponent, {
            width: '400px',
            height: '400px',
            data: new MoveCopyDialogModel(node, initialDirectoryID, isCopy)
        });

    }

    downloadFile(file: CloudFile): void {
        const anchor = document.createElement('a');
        anchor.download = file.name;
        anchor.href = this.fsProvider.default().getDownloadURL(file);
        anchor.click();
        anchor.remove();
    }

    exportFile(file: CloudFile): void {
        const anchor = document.createElement('a');
        anchor.download = file.name;
        anchor.href = this.fsProvider.default().getExportURL(file);
        anchor.click();
        anchor.remove();
    }

shareNode(node: CloudNode) {
    this.dialog.open(FilesShareMenuDialogComponent, {
        width: '400px',
        height: '400px',
        data: node
    });
  }

}
