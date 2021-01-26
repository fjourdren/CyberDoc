import { Component, Input } from '@angular/core';
import { FilesNewFolderDialogComponent } from '../files-new-folder-dialog/files-new-folder-dialog.component';
import { CloudDirectory } from '../../../models/files-api-models';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../../global/loading-dialog/loading-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '../../../services/users/users.service';
import { FileSystemService } from '../../../services/filesystems/file-system.service';
import { FilesNoEnoughStorageDialogComponent } from '../files-no-enough-storage-dialog/files-no-enough-storage-dialog.component';

export class FileTemplate {
  id: string;
  fileSize: number;
  fileExtension: string;
  fontAwesomeIcon: string;
  newActionTranslation: string;
}

@Component({
  selector: 'app-files-new-menu',
  templateUrl: './files-new-menu.component.html',
  styleUrls: ['./files-new-menu.component.css'],
})
export class FilesNewMenuComponent {
  FILE_TEMPLATES: FileTemplate[] = [
    {
      id: 'empty_docx',
      fileSize: 16377,
      fileExtension: 'docx',
      fontAwesomeIcon: 'fa-file-word',
      newActionTranslation: 'upload.new_docx_file',
    },
    {
      id: 'empty_doc',
      fileSize: 23040,
      fileExtension: 'doc',
      fontAwesomeIcon: 'fa-file-word',
      newActionTranslation: 'upload.new_doc_file',
    },
    {
      id: 'empty_odt',
      fileSize: 7909,
      fileExtension: 'odt',
      fontAwesomeIcon: 'fa-file-alt',
      newActionTranslation: 'upload.new_odt_file',
    },
    {
      id: 'empty_txt',
      fileSize: 0,
      fileExtension: 'txt',
      fontAwesomeIcon: 'fa-file',
      newActionTranslation: 'upload.new_txt_file',
    },
  ];

  @Input() currentDirectory: CloudDirectory;

  constructor(
    private usersService: UsersService,
    private fsService: FileSystemService,
    private dialog: MatDialog,
    private translateService: TranslateService,
  ) {}

  createFileFromTemplate(template: FileTemplate) {
    if (!this._isEnoughAvailableSpace(template.fileSize)) {
      return;
    }

    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      width: '96px',
      height: '96px',
    });

    this.translateService
      .get('upload.new_file_name')
      .toPromise()
      .then((filename) => {
        filename = `${filename}.${template.fileExtension}`;
        this.fsService
          .createFileFromTemplate(filename, this.currentDirectory, template.id)
          .toPromise()
          .finally(() => dialogRef.close());
      });
  }

  createFolder() {
    this.dialog.open(FilesNewFolderDialogComponent, {
      maxWidth: '400px',
      data: this.currentDirectory,
    });
  }

  uploadFile(file: File) {
    if (this._isEnoughAvailableSpace(file.size)) {
      this.fsService.startFileUpload(file, this.currentDirectory);
    }
  }

  private _isEnoughAvailableSpace(newFileSize: number) {
    const user = this.usersService.getActiveUser();
    if (user.usedSpace + newFileSize > user.availableSpace) {
      this.dialog.open(FilesNoEnoughStorageDialogComponent, {
        maxWidth: '400px',
      });
      return false;
    } else {
      return true;
    }
  }
}
