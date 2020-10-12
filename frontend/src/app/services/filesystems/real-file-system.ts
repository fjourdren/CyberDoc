import { HttpClient, HttpEventType } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CloudNode, CloudDirectory, SearchParams, FileTag } from 'src/app/models/files-api-models';
import { DIRECTORY_MIMETYPE } from '../files-utils/files-utils.service';
import { FileSystem, Upload } from './file-system';

const BASE_URL = "http://localhost:3000/v1";

export class RealFileSystem implements FileSystem {

    private _refreshNeeded$ = new EventEmitter<void>();
    private _currentUpload$ = new EventEmitter<Upload>();

    constructor(private httpClient: HttpClient) { }

    get(nodeID: string): Observable<CloudNode> {
        return this.httpClient.get<any>(`${BASE_URL}/files/${nodeID}`, {withCredentials: true}).pipe(map(response => {
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

    createDirectory(name: string, parentFolder: CloudDirectory): Observable<void> {
        return this.httpClient.post<any>(`${BASE_URL}/files`, {
            "folderID": parentFolder.id,
            "mimetype": DIRECTORY_MIMETYPE,
            "name": name
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    search(searchParams: SearchParams): Observable<CloudDirectory> {
        const currentDate = new Date();
        let startDate: Date;
        let endDate: Date;

        if (searchParams.dateDiff !== -1){
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

        return this.httpClient.post<any>(`${BASE_URL}/files/search`, {
            "tagIDs": searchParams.tagIDs.length > 0 ? searchParams.tagIDs : null,
            "name": searchParams.name,
           /* "mimetypes": [searchParams.type], */
            "startLastModifiedDate": startDate,
            "endLastModifiedDate": endDate
        }, {withCredentials: true}).pipe(map(response => {
            const folder = new CloudDirectory();

            folder.directoryContent = response.results;
            folder.id = "you-should-not-see-this";
            folder.name = "you-should-not-see-this";
            folder.isDirectory = true;
            folder.mimetype = DIRECTORY_MIMETYPE;
            folder.ownerName = "you-should-not-see-this";
            folder.path = [];
            folder.tags = [];

            return folder;
        }));

    }

    copy(node: CloudNode, fileName: string, destination: CloudDirectory): Observable<void> {
        return this.httpClient.post<any>(`${BASE_URL}/files/${node.id}/copy`, {
            "copyFileName": fileName,
            "destID": destination.id
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    move(node: CloudNode, destination: CloudDirectory): Observable<void> {
        return this.httpClient.patch<any>(`${BASE_URL}/files/${node.id}`, {
            "directoryID": destination.id,
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    rename(node: CloudNode, newName: string): Observable<void> {
        return this.httpClient.patch<any>(`${BASE_URL}/files/${node.id}`, {
            "name": newName
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    delete(node: CloudNode): Observable<void> {
        return this.httpClient.delete<any>(`${BASE_URL}/files/${node.id}`, {withCredentials: true})
            .pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    addTag(node: CloudNode, tag: FileTag): Observable<void> {
        console.warn(tag);
        return this.httpClient.post<any>(`${BASE_URL}/files/${node.id}/tags`, {
            "tagId": tag._id
        }, {withCredentials: true}).pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    removeTag(node: CloudNode, tag: FileTag): Observable<void> {
        return this.httpClient.delete<any>(`${BASE_URL}/files/${node.id}/${tag._id}`, {withCredentials: true})
            .pipe(map(response => this._refreshNeeded$.emit(), null));
    }

    getDownloadURL(node: CloudNode): string {
        return `${BASE_URL}/files/${node.id}/download`;
    }

    getExportURL(node: CloudNode): string {
        return `${BASE_URL}/files/${node.id}/export`;
    }

    getFilePreviewImageURL(node: CloudNode): string {
        return `${BASE_URL}/files/${node.id}/preview`;
    }

    startFileUpload(file: File, destination: CloudDirectory): void {
        const formData = new FormData();
        formData.append("folderID", destination.id);
        formData.append("mimetype", file.type);
        formData.append("name", file.name);
        formData.append("upfile", file);

        this.httpClient.post<any>(`${BASE_URL}/files`, formData, {
            reportProgress: true,
            observe: 'events',
            withCredentials: true
        }).pipe(map(event => {
            switch (event.type) {
                case HttpEventType.UploadProgress: {
                    const obj = {
                        filename: file.name,
                        progress: (event.loaded / event.total),
                        remainingSeconds: 7 //TODO
                    }
                    this._currentUpload$.emit(obj);
                    break;
                }
                case HttpEventType.Response: {
                    this._currentUpload$.emit(null);
                    break;
                }
            }
        })).toPromise().then(()=>{
            console.log("OK");
            this._refreshNeeded$.emit()
        }).catch((err)=>{
            console.error(err);
        })
    }

    cancelFileUpload(): void {
        throw new Error('Method not implemented.');
    }

    getCurrentFileUpload(): Observable<Upload> {
        return this._currentUpload$.asObservable();
    }

    refreshNeeded(): Observable<void> {
        return this._refreshNeeded$.asObservable();
    }

}