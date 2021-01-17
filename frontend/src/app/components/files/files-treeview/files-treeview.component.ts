import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input } from '@angular/core';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { UsersService } from 'src/app/services/users/users.service';
import { FilesTreeviewDataSource } from './files-treeview-datasource';
import { FilesTreeviewNode } from './files-treeview-node';

@Component({
  selector: 'app-files-treeview',
  templateUrl: './files-treeview.component.html',
  styleUrls: ['./files-treeview.component.scss'],
})
export class FilesTreeviewComponent {
  treeControl: FlatTreeControl<FilesTreeviewNode>;
  dataSource: FilesTreeviewDataSource;

  constructor(fsService: FileSystemService, usersService: UsersService) {
    this.treeControl = new FlatTreeControl<FilesTreeviewNode>(
      this.getLevel,
      this.isExpandable,
    );
    this.dataSource = new FilesTreeviewDataSource(this.treeControl, fsService);
    this._loading = true;
    const nodes: FilesTreeviewNode[] = [];

    Promise.all([
      usersService.getActiveUser().directory_id
        ? fsService.get(usersService.getActiveUser().directory_id).toPromise()
        : null,
      fsService.getSharedFiles().toPromise(),
    ]).then((values) => {
      if (usersService.getActiveUser().role === 'owner') {
        if (values[0].isDirectory) {
          nodes.push(new FilesTreeviewNode(values[0], 0, [], true, true, false));
        }
      }
      nodes.push(
        new FilesTreeviewNode(
          values[1],
          0,
          [],
          false,
          usersService.getActiveUser().role !== 'owner',
        ),
      );
      this.dataSource.data = nodes;
    });

    this._loading = false;
  }

  private _loading = false;

  get loading(): boolean {
    return this._loading || this.dataSource.loading;
  }

  private _currentDirectoryID: string;

  get currentDirectoryID(): string {
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

  _sharedWithMeMode: boolean;

  @Input()
  set sharedWithMeMode(val: boolean) {
    this._sharedWithMeMode = val;
  }

  _binMode: boolean;

  @Input()
  set binMode(val: boolean) {
    this._binMode = val;
  }
  getLevel = (node: FilesTreeviewNode) => node.level;
  isExpandable = (node: FilesTreeviewNode) => node.expandable;
  hasChild = (_: number, nodeData: FilesTreeviewNode) => nodeData.expandable;
}
