import { Observable } from 'rxjs';
import { CloudNode } from 'src/app/models/files-api-models';

export interface Upload {
    filename: string;
    progress: number;
    remainingSeconds: number;
}

export interface FileSystem {
    get(id: string): Observable<CloudNode>;
    upload(file: Blob, name: string, mimetype: string, folderID: string): Observable<void>;
    cancelUpload(): void;
    copy(sourceID: string, newFileName: string, destID: string): Observable<void>;
    move(sourceID: string, destID: string): Observable<void>;
    rename(fileID: string, newName: string): Observable<void>;
    delete(fileID: string): Observable<void>;

    currentUpload(): Observable<Upload>;
    refreshNeeded(): Observable<void>;
}