import { Observable } from 'rxjs';
import { CloudNode } from 'src/app/models/files-api-models';

export interface Upload {
    filename: string;
    progress: number;
    remainingSeconds: number;
}

export interface FileSystem {
    get(id: string): Observable<CloudNode>;
    copy(sourceID: string, newFileName: string, destID: string): Observable<void>;
    move(sourceID: string, destID: string): Observable<void>;
    rename(fileID: string, newName: string): Observable<void>;
    delete(fileID: string): Observable<void>;
    createDirectory(name: string, parentFolderID: string): Observable<void>;
    getDownloadURL(fileID: string): string;

    startFileUpload(file: Blob, name: string, mimetype: string, parentFolderID: string): void;
    cancelFileUpload(): void;
    getCurrentFileUpload(): Observable<Upload>;

    refreshNeeded(): Observable<void>;
}