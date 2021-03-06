import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { FilesTreeviewNode } from './files-treeview-node';

export class FilesTreeviewDataSource implements DataSource<FilesTreeviewNode> {
  loading = false;
  dataChange = new BehaviorSubject<FilesTreeviewNode[]>([]);

  get data(): FilesTreeviewNode[] {
    return this.dataChange.value;
  }
  set data(value: FilesTreeviewNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private treeControl: FlatTreeControl<FilesTreeviewNode>,
    private fsService: FileSystemService,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<FilesTreeviewNode[]> {
    this.treeControl.expansionModel.changed.subscribe((change) => {
      if (this.loading) return;
      if (change.added || change.removed) {
        this.handleTreeControl(change);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data),
    );
  }

  disconnect(): void {
    /*unused*/
  }

  handleTreeControl(change: SelectionChange<FilesTreeviewNode>) {
    if (this.loading) return;
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  toggleNode(node: FilesTreeviewNode, expand: boolean) {
    if (this.loading) return;
    const index = this.data.indexOf(node);
    if (
      expand &&
      node.directory._id !== 'shared-with-me' &&
      node.directory._id !== 'bin'
    ) {
      this.loading = true;
      this.fsService
        .get(node.directory._id)
        .toPromise()
        .then((fileNode) => {
          if (fileNode.isDirectory) {
            const folders = fileNode.directoryContent.filter(
              (v) => v.isDirectory,
            ) as CloudDirectory[];
            const newNodes = folders.map(
              (v) =>
                new FilesTreeviewNode(v, index + 1, [...node.parents, node]),
            );
            this.data.splice(index + 1, 0, ...newNodes);
            this.dataChange.next(this.data);
            this.loading = false;
          }
        });
    } else {
      this.data = this.data.filter((item) => {
        return item.level <= node.level || item.parents.indexOf(node) === -1;
      });
      this.dataChange.next(this.data);
    }
  }
}
