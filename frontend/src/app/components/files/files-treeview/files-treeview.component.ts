import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Input} from '@angular/core';
import {FileSystemProvider} from 'src/app/services/filesystems/file-system-provider';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';
import {FilesTreeviewDataSource} from './files-treeview-datasource';
import {FilesTreeviewNode} from './files-treeview-node';

@Component({
    selector: 'app-files-treeview',
    templateUrl: './files-treeview.component.html',
    styleUrls: ['./files-treeview.component.scss']
})
export class FilesTreeviewComponent {

    treeControl: FlatTreeControl<FilesTreeviewNode>;
    dataSource: FilesTreeviewDataSource;

    constructor(
        private fsProvider: FileSystemProvider,
        private userServiceProvider: UserServiceProvider
    ) {
        this.treeControl = new FlatTreeControl<FilesTreeviewNode>(this.getLevel, this.isExpandable);
        this.dataSource = new FilesTreeviewDataSource(this.treeControl, fsProvider);
        this._loading = true;
        const nodes: FilesTreeviewNode[] = [];

        Promise.all([
            userServiceProvider.default().getActiveUser().directory_id ?
                fsProvider.default().get(userServiceProvider.default().getActiveUser().directory_id).toPromise() : null,
            fsProvider.default().getSharedFiles().toPromise()]).then((values) => {
                if (userServiceProvider.default().getActiveUser().role === 'owner') {
                    if (values[0].isDirectory) {
                        nodes.push(new FilesTreeviewNode(values[0], 0, [], true, true));
                    }
                }
                nodes.push(new FilesTreeviewNode(values[1], 0, [], false, userServiceProvider.default().getActiveUser().role !== 'owner'));
                this.dataSource.data = nodes;
            }
        );

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

    getLevel = (node: FilesTreeviewNode) => node.level;
    isExpandable = (node: FilesTreeviewNode) => node.expandable;
    hasChild = (_: number, nodeData: FilesTreeviewNode) => nodeData.expandable;
}
