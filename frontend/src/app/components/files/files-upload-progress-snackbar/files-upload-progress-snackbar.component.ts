import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-upload-progress-snackbar',
  templateUrl: './files-upload-progress-snackbar.component.html',
  styleUrls: ['./files-upload-progress-snackbar.component.scss']
})
export class FilesUploadProgressSnackbarComponent {
  filename = "";
  currentlyUploading = false;
  progressionPercent = 0;
  remainingTimeSeconds = 0;

  constructor(
    private fsProvider: FileSystemProvider,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    fsProvider.default().getCurrentFileUpload().subscribe(state => {
      if (state) {
        this.filename = state.filename;
        this.progressionPercent = Math.round(state.progress * 100);
        this.remainingTimeSeconds = state.remainingSeconds;
        this.currentlyUploading = true;
      } else if (this.currentlyUploading) { //don't show success msg if upload canceled
        if (this.filename) {
          this.translate.get("upload.success").toPromise().then(msg => {
            this.snackBar.open(msg, null, {
              duration: 5000,
            });
          })
        }
        this.currentlyUploading = false;
      }
    })
  }

  cancelUpload() {
    this.currentlyUploading = false;
    this.fsProvider.default().cancelFileUpload();
    this.translate.get("upload.canceled").toPromise().then(msg => {
      this.snackBar.open(msg, null, {
        duration: 5000,
      });
    })
  }

}
