import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-breadcrumb',
  templateUrl: './files-breadcrumb.component.html',
  styleUrls: ['./files-breadcrumb.component.scss']
})
export class FilesBreadcrumbComponent {

  private _currentDirectoryID: string;
  @Output() currentDirectoryIDChange = new EventEmitter<string>();
  directory$: Observable<CloudDirectory>;
  contextMenuContent$: Observable<CloudDirectory[]>;

  constructor(private fsProvider: FileSystemProviderService) {
    fsProvider.default().refreshNeeded().subscribe(() => this.refresh());
  }

  get currentDirectoryID(): string {
    return this._currentDirectoryID;
  }

  @Input()
  set currentDirectoryID(val: string) {
    if (!val) return;
    this._currentDirectoryID = val;
    this.refresh();
  }

  refresh() {
    this.directory$ = this.fsProvider.default().get(this._currentDirectoryID).pipe(map(val => {
      if (val.isDirectory) {
        return val;
      }
    }));
  }

  onDirectorySelected(id: string) {
    this.currentDirectoryID = id;
    this.currentDirectoryIDChange.emit(id);
  }

  loadDataForContextMenu(file: { name: string, id: string }) {
    this.contextMenuContent$ = this.fsProvider.default().get(file.id).pipe(map((val) => {
      if (val.isDirectory) {
        return val.directoryContent.filter(v => v.isDirectory) as CloudDirectory[];
      }
    }));
  }

}
