import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';

@Component({
  selector: 'app-files-upload-progress-snackbar',
  templateUrl: './files-upload-progress-snackbar.component.html',
  styleUrls: ['./files-upload-progress-snackbar.component.scss'],
})
export class FilesUploadProgressSnackbarComponent {
  filename = '';
  currentlyUploading = false;
  progressionPercent = 0;
  remainingTimeSeconds = 0;

  constructor(
    private fsService: FileSystemService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    fsService.getCurrentFileUpload().subscribe((state) => {
      if (state) {
        if (state.error) {
          this.currentlyUploading = false;
          if (state.error.message.includes('507')) {
            this.translate
              .get('upload.insufficient_storage')
              .toPromise()
              .then((msg) => {
                this.snackBar.open(msg, null, {
                  duration: 5000,
                });
              });
          } else {
            throw state.error;
          }
        } else if (state.progress === 100) {
          this.currentlyUploading = false;
          this.translate
            .get('upload.success')
            .toPromise()
            .then((msg) => {
              this.snackBar.open(msg, null, {
                duration: 5000,
              });
            });
        } else {
          this.filename = state.filename;
          this.progressionPercent = Math.round(state.progress * 100);
          this.remainingTimeSeconds =
            Math.round(state.remainingSeconds / 10) * 10;
          this.currentlyUploading = true;
        }
      }
    });
  }

  cancelUpload() {
    this.currentlyUploading = false;
    this.fsService.cancelFileUpload();
    this.translate
      .get('upload.canceled')
      .toPromise()
      .then((msg) => {
        this.snackBar.open(msg, null, {
          duration: 5000,
        });
      });
  }
}
