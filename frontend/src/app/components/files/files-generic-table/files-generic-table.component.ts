import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { FilesTableRestrictions, NO_RESTRICTIONS } from './files-table-restrictions';
import { CloudFile, CloudNode } from 'src/app/models/files-api-models';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { FilesDeleteDialogComponent } from '../files-delete-dialog/files-delete-dialog.component';
import { FilesMoveCopyDialogComponent } from '../files-move-copy-dialog/files-move-copy-dialog.component';
import { MoveCopyDialogModel } from '../files-move-copy-dialog/move-copy-dialog-model';
import { MimetypeUtilsService } from 'src/app/services/mimetype-utils/mimetype-utils.service';
import { NgResizeObserver, ngResizeObserverProviders } from 'ng-resize-observer';
import { map } from 'rxjs/operators';
import { FilesGenericTableBottomsheetComponent, FilesGenericTableBottomsheetData } from '../files-generic-table-bottomsheet/files-generic-table-bottomsheet.component';
import { FilesRenameDialogComponent } from '../files-rename-dialog/files-rename-dialog.component';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

export type FileAction = "open" | "download" | "rename" | "copy" | "delete" | "move" | "details";

@Component({
  selector: 'app-files-generic-table',
  templateUrl: './files-generic-table.component.html',
  styleUrls: ['./files-generic-table.component.scss'],
  providers: [...ngResizeObserverProviders]
})
export class FilesGenericTableComponent implements AfterViewInit {

  isTouchScreen = 'ontouchstart' in window;
  unselectAfterContextMenuOrBottomSheet = false;

  displayedColumns = ['icon', 'name', 'type', 'size', 'date', 'menubutton'];
  dataSource = new MatTableDataSource([]);
  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  @Input() currentDirectoryID: string | null;
  @Input() showDetailsButton: boolean;
  @Output() selectedNodeChange = new EventEmitter<CloudNode>();
  @Output() openButtonClicked = new EventEmitter<CloudNode>();
  @Output() detailsButtonClicked = new EventEmitter<CloudNode>();

  private _selectedNode: CloudNode | null;
  private _restrictions: FilesTableRestrictions = NO_RESTRICTIONS;

  get selectedNode() {
    return this._selectedNode;
  }

  @Input()
  set selectedNode(val: CloudNode) {
    if (val && !this._restrictions.isSelectable(val)) return;
    this._selectedNode = val;
  }

  get items() {
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

  get restrictions() {
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
    private mimetypeUtils: MimetypeUtilsService,
    private resize: NgResizeObserver,
    private fsProvider: FileSystemProviderService,
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
    })
  }

  setSelectedNode(node: CloudNode) {
    if (node && !this._restrictions.isSelectable(node)) return;
    this.selectedNode = node;
    this.selectedNodeChange.emit(node);
  }

  getIconForMimetype(mimetype: string) {
    return this.mimetypeUtils.getFontAwesomeIconForMimetype(mimetype);
  }

  getFileTypeFromMimetype(mimetype: string) {
    return this.mimetypeUtils.getFileTypeForMimetype(mimetype);
  }

  isReadOnly(node: CloudNode) {
    return this.restrictions.isReadOnly(node) || node && node.name === "..";
  }

  onContextMenu(event: MouseEvent, node: CloudNode) {
    if (this._restrictions.isContextAndBottomSheetDisabled(node)) {
      return;
    }

    event.preventDefault();
    this.setSelectedNode(node);
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': node };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.unselectAfterContextMenuOrBottomSheet = true;
    this.contextMenu.openMenu();
  }

  openBottomSheet(node: CloudNode) {
    if (this._restrictions.isContextAndBottomSheetDisabled(node)) {
      return;
    }

    this.setSelectedNode(node);
    this.unselectAfterContextMenuOrBottomSheet = true;
    this.bottomSheet.open(FilesGenericTableBottomsheetComponent, {
      data: {
        callback: this.execActionOnSelectedNode.bind(this),
        readonlyMode: this.isReadOnly(node),
        showDetailsEntry: this.showDetailsButton,
        node: node,
        onBottomSheetClose: this.onBottomSheetClose.bind(this)
      } as FilesGenericTableBottomsheetData
    });
  }

  onBottomSheetClose() {
    if (this.unselectAfterContextMenuOrBottomSheet) {
      this.setSelectedNode(null);
      this.unselectAfterContextMenuOrBottomSheet = false;
    }
  }

  onClick(node: CloudNode) {
    if (this.isTouchScreen) {
      this.setSelectedNode(node);
      this.execActionOnSelectedNode("open");
    } else if (this.selectedNode && this.selectedNode === node) {
      this.setSelectedNode(null);
    } else if (this._restrictions.isSelectable(node)) {
      this.setSelectedNode(node);
    }
  }

  onDoubleClick(node: CloudNode) {
    this.setSelectedNode(node);
    this.execActionOnSelectedNode("open");
  }

  onTableWidthChanged(width: number) {
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

  execActionOnSelectedNode(action: FileAction) {
    switch (action) {
      case "open": {
        this.openButtonClicked.emit(this.selectedNode);
        break;
      }
      case "download": {
        if (!this.selectedNode.isDirectory) {
          this.downloadFile(this.selectedNode as CloudFile);
        }
        break;
      }
      case "details": {
        this.unselectAfterContextMenuOrBottomSheet = false;
        this.detailsButtonClicked.emit(this.selectedNode);
        break;
      }
      case "delete": {
        this.deleteNode(this.selectedNode);
        break;
      }
      case "rename": {
        this.renameNode(this.selectedNode);
        break;
      }
      case "move": {
        this.moveOrCopyNode(this.selectedNode, false);
        break;
      }
      case "copy": {
        this.moveOrCopyNode(this.selectedNode, true);
        break;
      }
    }
  }

  deleteNode(node: CloudNode) {
    this.dialog.open(FilesDeleteDialogComponent, {
      maxWidth: "400px",
      data: node
    });
  }

  renameNode(node: CloudNode) {
    this.dialog.open(FilesRenameDialogComponent, {
      maxWidth: "400px",
      data: node
    });
  }

  moveOrCopyNode(node: CloudNode, isCopy: boolean) {
    let initialDirectoryID = this.currentDirectoryID || this.userServiceProvider.default().getActiveUser().rootDirectoryID;
    this.dialog.open(FilesMoveCopyDialogComponent, {
      width: "400px",
      height: "400px",
      data: new MoveCopyDialogModel(node, initialDirectoryID, isCopy)
    });
  }

  downloadFile(file: CloudFile) {
    const anchor = document.createElement("a");
    anchor.download = file.name;
    anchor.href = this.fsProvider.default().getDownloadURL(file.id);
    anchor.click();
    anchor.remove();
  }

}
