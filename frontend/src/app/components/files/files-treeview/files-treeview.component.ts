import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';
import { FilesTreeviewDataSource } from './files-treeview-datasource';
import { FilesTreeviewNode } from './files-treeview-node';

@Component({
  selector: 'app-files-treeview',
  templateUrl: './files-treeview.component.html',
  styleUrls: ['./files-treeview.component.scss']
})
export class FilesTreeviewComponent {

  private _loading = false;
  private _currentDirectoryID: string;
  @Output() currentDirectoryIDChange = new EventEmitter<string>();

  constructor(private fsProvider: FileSystemProviderService) {
    this.treeControl = new FlatTreeControl<FilesTreeviewNode>(this.getLevel, this.isExpandable);
    this.dataSource = new FilesTreeviewDataSource(this.treeControl, fsProvider);
    this._loading = true;
    fsProvider.default().get("root").toPromise().then(root => { //TODO constant
      if (root.isDirectory) {
        this.dataSource.data = [new FilesTreeviewNode(root, 0, [], true, true)];
      }
    });
    this._loading = false;
  }

  get loading(){
    return this._loading || this.dataSource.loading;
  }

  get currentDirectoryID() {
    return this._currentDirectoryID;
  }

  @Input()
  set currentDirectoryID(val: string) {
    this._currentDirectoryID = val;
    if (this.treeControl.dataNodes){
      for (const node of this.treeControl.dataNodes) {
        node.selected = node.directory.id === val;
      }  
    }
  }

  treeControl: FlatTreeControl<FilesTreeviewNode>;
  dataSource: FilesTreeviewDataSource;

  onClick(directory: CloudDirectory) {
    this.currentDirectoryIDChange.emit(directory.id);
  }

  getLevel = (node: FilesTreeviewNode) => node.level;
  isExpandable = (node: FilesTreeviewNode) => node.expandable;
  hasChild = (_: number, nodeData: FilesTreeviewNode) => nodeData.expandable;
}
