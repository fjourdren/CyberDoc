import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
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

  constructor(
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider
  ) {
    this.treeControl = new FlatTreeControl<FilesTreeviewNode>(this.getLevel, this.isExpandable);
    this.dataSource = new FilesTreeviewDataSource(this.treeControl, fsProvider);
    this._loading = true;
    let nodes: FilesTreeviewNode[] = [];
    if(userServiceProvider.default().getActiveUser().role === "owner") {
      fsProvider.default().get(userServiceProvider.default().getActiveUser().directory_id).toPromise().then(root => {
        if (root.isDirectory) {
          nodes.push(new FilesTreeviewNode(root, 0, [], true, true));
        }
      });
    }
    fsProvider.default().get(userServiceProvider.default().getActiveUser().sharedFilesDirectoryId).toPromise().then(root => {
      if (root.isDirectory) {
        nodes.push(new FilesTreeviewNode(root, 0, [], false, true));
        this.dataSource.data = nodes;
      }
    });
    this._loading = false;
  }

  get loading() {
    return this._loading || this.dataSource.loading;
  }

  get currentDirectoryID() {
    return this._currentDirectoryID;
  }

  @Input()
  set currentDirectoryID(val: string) {
    this._currentDirectoryID = val;
    if (this.treeControl.dataNodes) {
      for (const node of this.treeControl.dataNodes) {
        node.selected = node.directory._id === val;
      }
    }
  }

  treeControl: FlatTreeControl<FilesTreeviewNode>;
  dataSource: FilesTreeviewDataSource;

  getLevel = (node: FilesTreeviewNode) => node.level;
  isExpandable = (node: FilesTreeviewNode) => node.expandable;
  hasChild = (_: number, nodeData: FilesTreeviewNode) => nodeData.expandable;
}
