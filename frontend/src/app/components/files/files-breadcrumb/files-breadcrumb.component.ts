import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';

@Component({
  selector: 'app-files-breadcrumb',
  templateUrl: './files-breadcrumb.component.html',
  styleUrls: ['./files-breadcrumb.component.scss'],
})
export class FilesBreadcrumbComponent {
  @Input() currentDirectory: CloudDirectory;
  @Input() sharedWithMeMode: boolean;
  @Input() binMode: boolean;
  contextMenuContent$: Observable<CloudDirectory[]>;

  constructor(private fsService: FileSystemService) {}

  loadDataForContextMenu(directoryID: string) {
    this.contextMenuContent$ = this.fsService.get(directoryID).pipe(
      map((val) => {
        if (val.isDirectory) {
          return val.directoryContent.filter(
            (v) => v.isDirectory,
          ) as CloudDirectory[];
        }
      }),
    );
  }
}
