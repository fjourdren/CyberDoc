import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, Component } from '@angular/core';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { UsersService } from 'src/app/services/users/users.service';
import { FilesTreeviewDataSource } from './files-treeview-datasource';
import { FilesTreeviewNode } from './files-treeview-node';
import { CloudDirectory } from '../../../models/files-api-models';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-files-treeview',
  templateUrl: './files-treeview.component.html',
  styleUrls: ['./files-treeview.component.scss'],
})
export class FilesTreeviewComponent implements AfterViewInit {
  treeControl: FlatTreeControl<FilesTreeviewNode>;
  dataSource: FilesTreeviewDataSource;

  private _refreshSelection(url: string) {
    if (this.treeControl.dataNodes) {
      for (const node of this.treeControl.dataNodes) {
        console.warn(node.url.join('/'), url, node.url.join('/') === url);
        node.selected = node.url.join('/') === url;
      }
    }
  }

  constructor(
    fsService: FileSystemService,
    usersService: UsersService,
    router: Router,
  ) {
    router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this._refreshSelection(evt.url);
      }
    });

    this.treeControl = new FlatTreeControl<FilesTreeviewNode>(
      this.getLevel,
      this.isExpandable,
    );
    this.dataSource = new FilesTreeviewDataSource(this.treeControl, fsService);
    const nodes: FilesTreeviewNode[] = [];

    const rootFolder = new CloudDirectory();
    rootFolder._id = usersService.getActiveUser().directory_id;
    rootFolder.name = 'My safebox';

    const sharedFilesDirectory = new CloudDirectory();
    sharedFilesDirectory._id = 'shared-with-me';
    sharedFilesDirectory.name = 'Shared with me';

    const binDirectory = new CloudDirectory();
    binDirectory._id = 'bin';
    binDirectory.name = 'Bin';

    nodes.push(new FilesTreeviewNode(rootFolder, 0, [], true, false));

    nodes.push(
      new FilesTreeviewNode(
        sharedFilesDirectory,
        0,
        [],
        false,
        false,
        'folder_shared',
        ['/shared-with-me'],
      ),
    );
    nodes.push(
      new FilesTreeviewNode(binDirectory, 0, [], false, false, 'delete', [
        '/bin',
      ]),
    );

    this.dataSource.data = nodes;
  }

  get loading(): boolean {
    return this.dataSource.loading;
  }

  getLevel = (node: FilesTreeviewNode) => node.level;
  isExpandable = (node: FilesTreeviewNode) => node.expandable;
  hasChild = (_: number, nodeData: FilesTreeviewNode) => nodeData.expandable;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._refreshSelection(location.pathname);
    }, 10);
  }
}
