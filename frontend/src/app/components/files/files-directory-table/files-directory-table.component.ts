import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';
import { FilesTableRestrictions, NO_RESTRICTIONS } from '../files-generic-table/files-table-restrictions';

@Component({
  selector: 'app-files-directory-table',
  templateUrl: './files-directory-table.component.html',
  styleUrls: ['./files-directory-table.component.scss'],
})
export class FilesDirectoryTableComponent {

  loading = false;
  items: CloudNode[];

  @Input() showDetailsButton: boolean;
  @Output() currentDirectoryIDChange = new EventEmitter<string>();
  @Output() selectedNodeIDChange = new EventEmitter<string>();
  @Output() detailsButtonClicked = new EventEmitter<CloudNode>();

  private _currentDirectoryID: string;
  private _selectedNodeID: string;
  private _selectedNode: CloudNode;
  private _restrictions: FilesTableRestrictions = NO_RESTRICTIONS;

  get selectedNode(){
    return this._selectedNode;
  }

  set selectedNode(node: CloudNode) {
    this._selectedNode = node;
    if (node) {
      this.selectedNodeID = node.id;
    } else {
      this.selectedNodeID = null;
    }
  }

  get currentDirectoryID() {
    return this._currentDirectoryID;
  }

  @Input()
  set currentDirectoryID(directoryID: string) {
    this.selectedNodeID = null;
    this._currentDirectoryID = directoryID;
    this.currentDirectoryIDChange.emit(directoryID);
    this.refreshTable();
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

  get selectedNodeID() {
    return this._selectedNodeID;
  }

  @Input()
  set selectedNodeID(val: string) {
    if (val) {
      for (const file of this.items) {
        if (file.id === val) {
          this._selectedNode = file;
          this._selectedNodeID = val;
        }
      }
    } else {
      this._selectedNode = null;
      this._selectedNodeID = null;
    }

    this.selectedNodeIDChange.emit(val);
  }

  constructor(private fsProvider: FileSystemProviderService) {
    this.fsProvider.default().refreshNeeded().subscribe(() => this.refreshTable());
  }

  openButtonClicked(node: CloudNode) {
    if (node.isDirectory) {
      this.currentDirectoryID = node.id;
    } else {
      //TODO
    }
  }  

  refreshTable() {
    if (!this._currentDirectoryID) return;
    this.loading = true;
    this.fsProvider.default().get(this._currentDirectoryID).toPromise().then(node => {
      if (node.isDirectory) {
        this.items = node.directoryContent;
      } else {
        //TODO
      }
      this.loading = false;
    });
  }
}