import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CloudDirectory, PathItem } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-breadcrumb',
  templateUrl: './files-breadcrumb.component.html',
  styleUrls: ['./files-breadcrumb.component.scss']
})
export class FilesBreadcrumbComponent {

  @Input() currentDirectory: CloudDirectory;
  contextMenuContent$: Observable<CloudDirectory[]>;

  constructor(private fsProvider: FileSystemProvider) { }

  loadDataForContextMenu(directory: CloudDirectory) {
    this.contextMenuContent$ = this.fsProvider.default().get(directory._id).pipe(map((val) => {
      if (val.isDirectory) {
        return val.directoryContent.filter(v => v.isDirectory) as CloudDirectory[];
      }
    }));
  }
}
