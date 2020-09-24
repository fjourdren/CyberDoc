import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgResizeObserver, ngResizeObserverProviders } from 'ng-resize-observer';
import { map } from 'rxjs/operators';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';
import { MimetypeUtilsService } from 'src/app/services/mimetype-utils/mimetype-utils.service';
import { FilesDeleteDialogComponent } from '../files-delete-dialog/files-delete-dialog.component';
import { FilesMoveCopyDialogComponent } from '../files-move-copy-dialog/files-move-copy-dialog.component';
import { MoveCopyDialogModel } from '../files-move-copy-dialog/move-copy-dialog-model';
import { FilesRenameDialogComponent } from '../files-rename-dialog/files-rename-dialog.component';
import { FilesTableBottomSheetComponent } from './files-table-bottom-sheet.component';
import { FilesTableRestrictions } from './files-table-restrictions';

export type FileAction = "open" | "download" | "rename" | "copy" | "delete" | "move" | "details";

const TOUCH_SCREEN = 'ontouchstart' in window;
const NO_RESTRICTIONS: FilesTableRestrictions = {
  isSelectable: (node: CloudNode) => true,
  isReadOnly: (node: CloudNode) => false,
  isDisabled: (node: CloudNode) => false,
  isContextAndBottomSheetDisabled: (node: CloudNode) => false
}

@Component({
  selector: 'app-files-table',
  templateUrl: './files-table.component.html',
  styleUrls: ['./files-table.component.scss'],
  providers: [...ngResizeObserverProviders]
})
export class FilesTableComponent implements AfterViewInit {

  loading = false;
  singleClickDone = false;
  doubleClickDone = false;

  unselectAfterContextMenuOrBottomSheet = false;

  displayedColumns: string[] = ['icon', 'name', 'type', 'size', 'date', 'menubutton'];
  dataSource = new MatTableDataSource([]);
  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  private _restrictions: FilesTableRestrictions = NO_RESTRICTIONS;
  private _isNodeDetailsSidenavLocked: boolean;
  @Output() openNodeDetailsSidenav = new EventEmitter<void>();

  private _currentDirectoryID: string;
  @Output() currentDirectoryIDChange = new EventEmitter<string>();

  private _selectedNodeID: string;
  selectedNode: CloudNode;
  @Output() selectedNodeIDChange = new EventEmitter<string>();

  get currentDirectoryID() {
    return this._currentDirectoryID;
  }

  @Input()
  set currentDirectoryID(val: string) {
    if (!val) return;
    this.selectedNode = null;
    this._selectedNodeID = null;
    this.selectedNodeIDChange.emit(null);
    this._currentDirectoryID = val;
    this.refreshTable();
  }

  private _privateSetCurrentDirectoryID(val: string) {
    this._privateSetSelectedNodeID(null);
    this._currentDirectoryID = val;
    this.currentDirectoryIDChange.emit(val);
  }

  get selectedNodeID() {
    return this._selectedNodeID;
  }

  @Input()
  set selectedNodeID(val: string) {
    if (val) {
      for (const file of this.dataSource.data) {
        if (file.id === val) {
          if (this.restrictions.isSelectable(file)) {
            this.selectedNode = file;
            this._selectedNodeID = val;
          }
          break;
        }
      }
    } else {
      this.selectedNode = null;
      this._selectedNodeID = null;
    }
  }

  private _privateSetSelectedNodeID(val: CloudNode) {
    if (val) {
      this._selectedNodeID = val.id;
      this.selectedNodeIDChange.emit(val.id);
    }
    this.selectedNode = val;
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

  get isNodeDetailsSidenavLocked(): boolean {
    return this._isNodeDetailsSidenavLocked;
  }

  @Input()
  set isNodeDetailsSidenavLocked(val: boolean) {
    this._isNodeDetailsSidenavLocked = val;
  }

  constructor(private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private fsProvider: FileSystemProviderService,
    private mimetypeUtils: MimetypeUtilsService,
    private resize: NgResizeObserver) {
    resize.pipe(map(entry => entry.contentRect.width)).subscribe(this.onTableWidthChanged.bind(this));
    this.fsProvider.default().refreshNeeded().subscribe(() => this.refreshTable());
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.contextMenu.menuClosed.subscribe(() => {
      if (this.unselectAfterContextMenuOrBottomSheet) {
        this._privateSetSelectedNodeID(null);
        this.unselectAfterContextMenuOrBottomSheet = false;
      }
    })
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
    this._privateSetSelectedNodeID(node);
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

    this._privateSetSelectedNodeID(node);
    this.unselectAfterContextMenuOrBottomSheet = true;
    this.bottomSheet.open(FilesTableBottomSheetComponent, {
      data: {
        callback: this.execActionOnSelectedNode.bind(this),
        readonlyMode: this.isReadOnly(node),
        showDetailsEntry: !this.isNodeDetailsSidenavLocked,
        node: node,
        onBottomSheetClose: this.onBottomSheetClose.bind(this)
      }
    });
  }

  onBottomSheetClose() {
    if (this.unselectAfterContextMenuOrBottomSheet) {
      this._privateSetSelectedNodeID(null);
      this.unselectAfterContextMenuOrBottomSheet = false;
    }
  }

  onClick(node: CloudNode) {
    if (TOUCH_SCREEN) {
      this._privateSetSelectedNodeID(node);
      this.execActionOnSelectedNode("open");
    } else if (this.selectedNodeID && this.selectedNodeID === node.id) {
      this._privateSetSelectedNodeID(null);
    } else if (this._restrictions.isSelectable(node)) {
      this._privateSetSelectedNodeID(node);
    }
  }

  onDoubleClick(node: CloudNode) {
    if (node.isDirectory) {
      this._privateSetCurrentDirectoryID(node.id);
    } else {
      this._privateSetSelectedNodeID(node);
      this.execActionOnSelectedNode("open");
      this._privateSetSelectedNodeID(null);
    }
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

  refreshTable() {
    this.loading = true;
    this.fsProvider.default().get(this._currentDirectoryID).toPromise().then(node => {
      if (node.isDirectory) {
        if (node.path.length >= 1) {
          const parentDir = node.path[node.path.length - 1];
          let parentDirectoryEntry = { ...node, name: "..", id: parentDir.id, content: [], path: [] };

          this.dataSource.data = [
            parentDirectoryEntry,
            ...node.directoryContent
          ]
        } else {
          this.dataSource.data = node.directoryContent;
        }
      } else {
        //TODO
      }

      this.dataSource.sort = this.sort;
      this.loading = false;
    });
  }

  execActionOnSelectedNode(action: FileAction) {
    switch (action) {
      case "open": {
        if (this.selectedNode.isDirectory) {
          this._privateSetCurrentDirectoryID(this.selectedNode.id);
        } else {
          alert("TODO");
        }
        break;
      }
      case "download": {
        alert("TODO");
        break;
      }
      case "details": {
        this.unselectAfterContextMenuOrBottomSheet = false;
        this.openNodeDetailsSidenav.emit(null);
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
    const dialogRef = this.dialog.open(FilesDeleteDialogComponent, {
      maxWidth: "400px",
      data: node
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.refreshTable();
      }
    });
  }

  renameNode(node: CloudNode) {
    const dialogRef = this.dialog.open(FilesRenameDialogComponent, {
      maxWidth: "400px",
      data: node
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.refreshTable();
      }
    });
  }

  moveOrCopyNode(node: CloudNode, isCopy: boolean) {
    const dialogRef = this.dialog.open(FilesMoveCopyDialogComponent, {
      width: "400px",
      height: "400px",
      data: new MoveCopyDialogModel(node, this.currentDirectoryID, isCopy)
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.refreshTable()
      }
    });
  }
}