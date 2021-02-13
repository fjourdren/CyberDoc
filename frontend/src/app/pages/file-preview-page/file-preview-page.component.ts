import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemService } from '../../services/filesystems/file-system.service';
import { CloudFile } from '../../models/files-api-models';
import { FilesUtilsService } from '../../services/files-utils/files-utils.service';

@Component({
  selector: 'app-file-preview-page',
  templateUrl: './file-preview-page.component.html',
  styleUrls: ['./file-preview-page.component.css'],
})
export class FilePreviewPageComponent implements OnInit {
  @ViewChild('pdfJsViewerComponent') pdfJsViewerComponent;
  loadingPdfFile = true;
  file: CloudFile;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private filesUtils: FilesUtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private fsService: FileSystemService,
  ) {}

  getIconForMimetype(mimetype: string): string {
    const fileType = this.filesUtils.getFileTypeForMimetype(mimetype);
    return this.filesUtils.getFontAwesomeIcon(fileType);
  }

  onBackBtnClick() {
    this.router.navigate(['files', this.file.parent_file_id]);
  }

  onDownloadBtnClick() {
    const anchor = document.createElement('a');
    anchor.download = this.file.name;
    anchor.href = this.fsService.getDownloadURL(this.file);
    anchor.click();
    anchor.remove();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.fsService
        .get(paramMap.get('fileID'))
        .toPromise()
        .then((node) => {
          if (node.isDirectory) {
            throw new Error('Preview is not available for folders');
          } else {
            this.file = node as CloudFile;
            this._downloadPdfFile();
          }
        });
    });
  }

  private _downloadPdfFile() {
    this.loadingPdfFile = true;
    this.http
      .get(this.fsService.getExportURL(this.file), {
        responseType: 'blob',
        withCredentials: true,
      })
      .toPromise()
      .then((blob) => {
        this.pdfJsViewerComponent.pdfSrc = blob;
        this.pdfJsViewerComponent.refresh();
        this.loadingPdfFile = false;
      });
  }
}
