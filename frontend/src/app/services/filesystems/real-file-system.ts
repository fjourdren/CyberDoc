import {HttpClient} from '@angular/common/http';
import {EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
    CloudDirectory,
    CloudFile,
    CloudNode,
    FileTag,
    RespondShare,
    SearchParams
} from 'src/app/models/files-api-models';
import {DIRECTORY_MIMETYPE} from '../files-utils/files-utils.service';
import {FileSystem, Upload} from './file-system';
import { environment } from "src/environments/environment";

export class RealFileSystem implements FileSystem {

    private _refreshNeeded$ = new EventEmitter<void>();
    private _currentUpload$ = new EventEmitter<Upload>();

    private _uploadXhr: XMLHttpRequest;
    private _timeStarted: number = -1;

    constructor(private httpClient: HttpClient) {}

    share(fileID: string, email: String): Observable<void> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/files/${fileID}/sharing`, {
            "email": email
        }, {withCredentials: true}).pipe(map(response => {
            this._refreshNeeded$.emit();
        }, null));
    }

    getSharedWith(fileID: String): Observable<RespondShare[]>{
        return this.httpClient.get<any>(`${environment.apiBaseURL}/files/${fileID}/sharing`, {withCredentials: true}).pipe(map(response => {    
            return response.shared_users as RespondShare[];
        }));
    }

    getSharedWithPending(fileID: String): Observable<string[]>{
        return this.httpClient.get<any>(`${environment.apiBaseURL}/files/${fileID}/sharing`, {withCredentials: true}).pipe(map(response => {
            return response.shared_users_pending as string[];
        }));
    }

    deleteShare(fileID: string, email: String): Observable<void>{
        return this.httpClient.delete<any>(`${environment.apiBaseURL}/files/${fileID}/sharing/${email}`, {withCredentials: true})
            .pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    get(nodeID: string): Observable<CloudNode> {
        return this.httpClient.get<any>(`${environment.apiBaseURL}/files/${nodeID}`, {withCredentials: true}).pipe(map(response => {
            const node: CloudNode = response.content;
            node.isDirectory = node.mimetype === DIRECTORY_MIMETYPE;
            if (node.isDirectory) {
                for (const file of node.directoryContent) {
                    file.isDirectory = file.mimetype === DIRECTORY_MIMETYPE;
                }
            }
            return node;
        }));
    }

    getSharedFiles(): Observable<CloudDirectory> {
        return this.httpClient.get<any>(`${environment.apiBaseURL}/files/shared`, {withCredentials: true}).pipe(map(response => {
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
        }));
    }

    createDirectory(name: string, parentFolder: CloudDirectory): Observable<void> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/files`, {
            "folderID": parentFolder._id,
            "mimetype": DIRECTORY_MIMETYPE,
            "name": name
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    search(searchParams: SearchParams): Observable<CloudDirectory> {
        const currentDate = new Date();
        let startDate: Date;
        let endDate: Date;

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

        return this.httpClient.post<any>(`${environment.apiBaseURL}/files/search`, {
            "tagIDs": searchParams.tagIDs.length > 0 ? searchParams.tagIDs : null,
            "name": searchParams.name,
            "type": searchParams.type,
            "startLastModifiedDate": startDate,
            "endLastModifiedDate": endDate
        }, {withCredentials: true}).pipe(map(response => {
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
        }));

    }

    copy(file: CloudFile, fileName: string, destination: CloudDirectory): Observable<void> {
        return this.httpClient.post<any>(`${environment.apiBaseURL}/files/${file._id}/copy`, {
            "copyFileName": fileName,
            "destID": destination._id
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    move(node: CloudNode, destination: CloudDirectory): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/files/${node._id}`, {
            "directoryID": destination._id,
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    rename(node: CloudNode, newName: string): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/files/${node._id}`, {
            "name": newName
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    delete(node: CloudNode): Observable<void> {
        return this.httpClient.delete<any>(`${environment.apiBaseURL}/files/${node._id}`, {withCredentials: true})
            .pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    setPreviewEnabled(file: CloudFile, enabled: boolean): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/files/${file._id}`, {
            "preview": enabled,
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    setShareMode(file: CloudFile, shareMode: string): Observable<void> {
        return this.httpClient.patch<any>(`${environment.apiBaseURL}/files/${file._id}`, {
            "shareMode": shareMode,
        }, { withCredentials: true }).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    addTag(node: CloudNode, tag: FileTag): Observable<void> {
        console.warn(tag);
        return this.httpClient.post<any>(`${environment.apiBaseURL}/files/${node._id}/tags`, {
            "tagId": tag._id
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    removeTag(node: CloudNode, tag: FileTag): Observable<void> {
        return this.httpClient.delete<any>(`${environment.apiBaseURL}/files/${node._id}/tags/${tag._id}`, {withCredentials: true})
            .pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    getDownloadURL(node: CloudNode): string {
        return `${environment.apiBaseURL}/files/${node._id}/download`;
    }

    getExportURL(node: CloudNode): string {
        return `${environment.apiBaseURL}/files/${node._id}/export`;
    }

    getFilePreviewImageURL(node: CloudNode): string {
        return `${environment.apiBaseURL}/files/${node._id}/preview`;
    }


    startFileUpload(file: File, destination: CloudDirectory): void {
        const formData = new FormData();
        formData.append("folderID", destination._id);
        formData.append("mimetype", file.type || "application/octet-stream");
        formData.append("name", file.name);
        formData.append("upfile", file);

        //Need to use a XMLHttpRequest, to have cancel capability
        this._uploadXhr = new XMLHttpRequest();
        this._uploadXhr.upload.onprogress = (evt) => {
            //https://stackoverflow.com/questions/21162749/how-do-i-calculate-the-time-remaining-for-my-upload
            let timeElasped = 0;
            if (this._timeStarted === -1) {
                this._timeStarted = Date.now();
                timeElasped = 1;
            } else {
                timeElasped = Date.now() - this._timeStarted;
            }

            const uploadSpeed = evt.loaded / (timeElasped / 1000);
            const obj = {
                filename: file.name,
                progress: (evt.loaded / evt.total),
                remainingSeconds: (evt.total - evt.loaded) / uploadSpeed
            }
            this._currentUpload$.emit(obj);
        }

        this._uploadXhr.onerror = (evt) => {
            this._currentUpload$.emit(null);
            this._timeStarted = -1;
            this._uploadXhr = null;
            throw new Error("Error while uploading"); //TODO better handling
        }

        this._uploadXhr.onreadystatechange = () => {
            if (this._uploadXhr.readyState === XMLHttpRequest.DONE) {
                this._currentUpload$.emit(null);
                this._refreshNeeded$.emit(null);
                this._timeStarted = -1;
                this._uploadXhr = null;
            }
        }

        this._uploadXhr.onabort = () => {
            this._currentUpload$.emit(null);
            this._timeStarted = -1;
            this._uploadXhr = null;
        }

        this._uploadXhr.open("POST", `${environment.apiBaseURL}/files`, true);
        this._uploadXhr.withCredentials = true;
        this._uploadXhr.send(formData);
    }

    cancelFileUpload(): void {
        if (this._uploadXhr) {
            this._uploadXhr.abort();
        }
    }

    getCurrentFileUpload(): Observable<Upload> {
        return this._currentUpload$.asObservable();
    }

    refreshNeeded(): Observable<void> {
        return this._refreshNeeded$.asObservable();
    }

}