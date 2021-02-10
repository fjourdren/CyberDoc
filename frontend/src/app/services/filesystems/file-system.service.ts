import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CloudDirectory,
  CloudFile,
  CloudNode,
  FileTag,
  RespondAnswerSign,
  RespondShare,
  SearchParams,
} from 'src/app/models/files-api-models';
import { DIRECTORY_MIMETYPE } from '../files-utils/files-utils.service';
import { environment } from 'src/environments/environment';

export interface Upload {
  filename: string;
  progress: number;
  remainingSeconds: number;
  error: Error;
}

@Injectable({
  providedIn: 'root',
})
export class FileSystemService {
  private _refreshNeeded$ = new EventEmitter<void>();
  private _currentUpload$ = new EventEmitter<Upload>();

  private _uploadAborted = false;
  private _uploadXhr: XMLHttpRequest;
  private _timeStarted = -1;

  constructor(private httpClient: HttpClient) {}

  share(fileID: string, email: string): Observable<void> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/file-sharing/${fileID}`,
        {
          email,
        },
        { withCredentials: true },
      )
      .pipe(
        map(() => {
          this._refreshNeeded$.emit();
        }, null),
      );
  }

  getSharedWith(fileID: string): Observable<RespondShare[]> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/file-sharing/${fileID}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response.shared_users as RespondShare[];
        }),
      );
  }

  getSharedWithPending(fileID: string): Observable<string[]> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/file-sharing/${fileID}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response.shared_users_pending as string[];
        }),
      );
  }

  deleteShare(fileID: string, email: string): Observable<void> {
    return this.httpClient
      .delete<any>(
        `${environment.apiBaseURL}/file-sharing/${fileID}/${email}`,
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  sign(fileID: string): Observable<void> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/file-signing/${fileID}/sign`,
        {},
        { withCredentials: true },
      )
      .pipe(
        map(() => {
          this._refreshNeeded$.emit();
        }, null),
      );
  }

  listSignatories(fileID: string): Observable<RespondAnswerSign[]> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/files/${fileID}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response.content.signs as RespondAnswerSign[];
        }),
      );
  }

  get(nodeID: string): Observable<CloudNode> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/files/${nodeID}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          const node: CloudNode = response.content;
          node.isDirectory = node.mimetype === DIRECTORY_MIMETYPE;
          if (node.isDirectory) {
            for (const file of node.directoryContent) {
              file.isDirectory = file.mimetype === DIRECTORY_MIMETYPE;
            }
          }
          return node;
        }),
      );
  }

  getSharedFiles(): Observable<CloudDirectory> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/file-sharing/shared-files`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          const folder = new CloudDirectory();

          folder.directoryContent = response.results;
          folder._id = null;
          folder.name = null;
          folder.isDirectory = true;
          folder.mimetype = DIRECTORY_MIMETYPE;
          folder.ownerName = null;
          folder.path = [];
          folder.tags = [];
          return folder;
        }),
      );
  }

  getBinFiles(): Observable<CloudDirectory> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/files/bin`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          const folder = new CloudDirectory();

          folder.directoryContent = response.results;
          folder._id = null;
          folder.name = null;
          folder.isDirectory = true;
          folder.mimetype = DIRECTORY_MIMETYPE;
          folder.ownerName = null;
          folder.path = [];
          folder.tags = [];
          return folder;
        }),
      );
  }

  createDirectory(
    name: string,
    parentFolder: CloudDirectory,
  ): Observable<void> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/files`,
        {
          folderID: parentFolder._id,
          mimetype: DIRECTORY_MIMETYPE,
          name,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  createFileFromTemplate(
    name: string,
    parentFolder: CloudDirectory,
    templateID: string,
  ) {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/files/create-from-template`,
        {
          folderID: parentFolder._id,
          name,
          templateID,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  search(searchParams: SearchParams): Observable<CloudDirectory> {
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;

    if (!searchParams.name) {
      delete searchParams.name;
    }
    if (!searchParams.type) {
      delete searchParams.type;
    }
    if (!searchParams.tagIDs) {
      delete searchParams.tagIDs;
    }
    if (!searchParams.dateDiff) {
      delete searchParams.dateDiff;
    }

    if (searchParams.dateDiff !== -1) {
      startDate = new Date(currentDate);
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setDate(startDate.getDate() - searchParams.dateDiff);

      endDate = new Date(currentDate);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);
    }

    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/files/search`,
        {
          tagIDs: searchParams.tagIDs.length > 0 ? searchParams.tagIDs : null,
          name: searchParams.name,
          type: searchParams.type,
          startLastModifiedDate: startDate,
          endLastModifiedDate: endDate,
        },
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          const folder = new CloudDirectory();

          const results: CloudNode[] = response.results;
          folder.directoryContent = results.map((item) => {
            item.isDirectory = item.mimetype === DIRECTORY_MIMETYPE;
            return item;
          });
          folder._id = null;
          folder.name = null;
          folder.isDirectory = true;
          folder.mimetype = DIRECTORY_MIMETYPE;
          folder.ownerName = null;
          folder.path = [];
          folder.tags = [];

          return folder;
        }),
      );
  }

  copy(
    file: CloudFile,
    fileName: string,
    destination: CloudDirectory,
  ): Observable<void> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/files/${file._id}/copy`,
        {
          copyFileName: fileName,
          destID: destination._id,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  move(node: CloudNode, destination: CloudDirectory): Observable<void> {
    return this.httpClient
      .patch<any>(
        `${environment.apiBaseURL}/files/${node._id}`,
        {
          directoryID: destination._id,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  rename(node: CloudNode, newName: string): Observable<void> {
    return this.httpClient
      .patch<any>(
        `${environment.apiBaseURL}/files/${node._id}`,
        {
          name: newName,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  delete(node: CloudNode): Observable<void> {
    if (!node.isDirectory) {
      if (node.bin_id) {
        return this.httpClient
          .delete<any>(`${environment.apiBaseURL}/files/${node._id}`, {
            withCredentials: true,
          })
          .pipe(map(() => this._refreshNeeded$.emit(), null));
      } else {
        return this.httpClient
          .delete<any>(`${environment.apiBaseURL}/files/${node._id}/sendBin`, {
            withCredentials: true,
          })
          .pipe(map(() => this._refreshNeeded$.emit(), null));
      }
    }
    return this.httpClient
      .delete<any>(`${environment.apiBaseURL}/files/${node._id}`, {
        withCredentials: true,
      })
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  purge() {
    return this.httpClient
      .delete<any>(`${environment.apiBaseURL}/files/bin`, {
        withCredentials: true,
      })
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  restore(node: CloudNode): Observable<void> {
    if (!node.bin_id) {
      new Error('Error, file not in bin');
    }
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/files/${node._id}/restore`, {
        withCredentials: true,
      })
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  setPreviewEnabled(file: CloudFile, enabled: boolean): Observable<void> {
    return this.httpClient
      .patch<any>(
        `${environment.apiBaseURL}/files/${file._id}`,
        {
          preview: enabled,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  setShareMode(file: CloudFile, shareMode: string): Observable<void> {
    return this.httpClient
      .patch<any>(
        `${environment.apiBaseURL}/files/${file._id}`,
        {
          shareMode,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  addTag(node: CloudNode, tag: FileTag): Observable<void> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/file-tags/${node._id}`,
        {
          tagId: tag._id,
        },
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  removeTag(node: CloudNode, tag: FileTag): Observable<void> {
    return this.httpClient
      .delete<any>(
        `${environment.apiBaseURL}/file-tags/${node._id}/${tag._id}`,
        { withCredentials: true },
      )
      .pipe(map(() => this._refreshNeeded$.emit(), null));
  }

  getDownloadURL(node: CloudNode, etherpadExportFormat?: string): string {
    if (etherpadExportFormat) {
      return `${environment.apiBaseURL}/files/${node._id}/download?etherpad_export_format=${etherpadExportFormat}`;
    } else {
      return `${environment.apiBaseURL}/files/${node._id}/download`;
    }
  }

  getExportURL(node: CloudNode): string {
    return `${environment.apiBaseURL}/files/${node._id}/export`;
  }

  getFilePreviewImageURL(node: CloudNode): string {
    return `${environment.apiBaseURL}/files/${node._id}/preview`;
  }

  getEtherpadURL(file: CloudFile): Observable<string> {
    return this.httpClient
      .get<any>(`${environment.apiBaseURL}/files/${file._id}/etherpad-url`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.url));
  }

  convertFileToEtherpadFormat(file: CloudFile): Observable<string> {
    return this.httpClient
      .post<any>(
        `${environment.apiBaseURL}/files/${file._id}/convert-to-etherpad`,
        null,
        {
          withCredentials: true,
        },
      )
      .pipe(map((response) => response.url));
  }

  startFileUpload(file: File, destination: CloudDirectory): void {
    const formData = new FormData();
    formData.append('folderID', destination._id);
    formData.append('mimetype', file.type || 'application/octet-stream');
    formData.append('name', file.name);
    formData.append('upfile', file);
    this._uploadAborted = false;

    // Need to use a XMLHttpRequest, to have cancel capability
    this._uploadXhr = new XMLHttpRequest();
    this._uploadXhr.upload.onprogress = (evt) => {
      // https://stackoverflow.com/questions/21162749/how-do-i-calculate-the-time-remaining-for-my-upload
      let timeElasped: number;
      if (this._timeStarted === -1) {
        this._timeStarted = Date.now();
        timeElasped = 1;
      } else {
        timeElasped = Date.now() - this._timeStarted;
      }

      const uploadSpeed = evt.loaded / (timeElasped / 1000);
      const obj = {
        filename: file.name,
        progress: evt.loaded / evt.total,
        remainingSeconds: (evt.total - evt.loaded) / uploadSpeed,
        error: null,
      };
      this._currentUpload$.emit(obj);
    };

    this._uploadXhr.onerror = this._uploadXhr.upload.onerror = () => {
      this._onXHRFinished(
        file.name,
        new Error('Unknown error while uploading'),
      );
    };

    this._uploadXhr.onreadystatechange = () => {
      if (
        this._uploadXhr.readyState === XMLHttpRequest.DONE &&
        !this._uploadAborted
      ) {
        if (this._uploadXhr.status < 200 && this._uploadXhr.status > 299) {
          this._onXHRFinished(
            file.name,
            new Error(
              `${this._uploadXhr.status} ${this._uploadXhr.statusText}`,
            ),
          );
        } else {
          this._onXHRFinished(file.name, null);
        }
      }
    };

    this._uploadXhr.onabort = this._uploadXhr.upload.onabort = () => {
      this._onXHRFinished(null, null);
    };

    this._uploadXhr.open('POST', `${environment.apiBaseURL}/files`, true);
    this._uploadXhr.withCredentials = true;
    this._uploadXhr.send(formData);
  }

  cancelFileUpload(): void {
    if (this._uploadXhr) {
      this._uploadAborted = true;
      this._uploadXhr.abort();
    }
  }

  getCurrentFileUpload(): Observable<Upload> {
    return this._currentUpload$.asObservable();
  }

  refreshNeeded(): Observable<void> {
    return this._refreshNeeded$.asObservable();
  }

  triggerRefreshNeededEvent() {
    this._refreshNeeded$.emit();
  }

  private _onXHRFinished(filename: string, error: Error) {
    if (error) {
      const obj = {
        filename: filename,
        progress: undefined,
        remainingSeconds: undefined,
        error: error,
      };
      this._currentUpload$.emit(obj);
    } else if (filename) {
      const obj = {
        filename: filename,
        progress: 100,
        remainingSeconds: 0,
        error: null,
      };
      this._currentUpload$.emit(obj);
    }
    this._currentUpload$.emit(null);
    this._timeStarted = -1;
    this._uploadXhr = null;

    if (!error) {
      this._refreshNeeded$.emit(null);
    }
  }
}
