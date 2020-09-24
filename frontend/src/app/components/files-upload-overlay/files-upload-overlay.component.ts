import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-upload-overlay',
  templateUrl: './files-upload-overlay.component.html',
  styleUrls: ['./files-upload-overlay.component.scss']
})
export class FilesUploadOverlayComponent implements OnInit {
  filename: string;
  hidden = true;
  progressionPercent: number;
  remainingTime: string;
  param: any;

  constructor(
    private fsProvider: FileSystemProviderService,
    private snackBar: MatSnackBar
  ) {
    fsProvider.default().currentUpload().subscribe(state => {
      if (state) {
        this.filename = state.filename;
        this.progressionPercent = state.progress * 100;
        this.remainingTime = `${state.remainingSeconds}s`;
        this.param = { remainingTime: this.remainingTime }
        this.hidden = false;
      } else {
        if (this.filename) {
          this.snackBar.open("File upload OK !", null, {
            duration: 2000,
          });
        }
        this.hidden = true;
      }
    })
  }

  ngOnInit(): void {
  }

}
