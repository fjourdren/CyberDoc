import { Observable } from 'rxjs';
import { CloudDirectory, CloudNode, FileTag, SearchParams } from 'src/app/models/files-api-models';

export interface Upload {
    filename: string;
    progress: number;
    remainingSeconds: number;
}

export interface FileSystem {

    get(nodeID: string): Observable<CloudNode>;
    createDirectory(name: string, parentFolder: CloudDirectory): Observable<void>;
    search(searchParams: SearchParams): Observable<CloudDirectory>;

    copy(node: CloudNode, fileName: string, destination: CloudDirectory): Observable<void>;
    move(node: CloudNode, destination: CloudDirectory): Observable<void>;
    rename(node: CloudNode, newName: string): Observable<void>;
    delete(node: CloudNode): Observable<void>;

    addTag(node: CloudNode, tag: FileTag): Observable<void>;
    removeTag(node: CloudNode, tag: FileTag): Observable<void>;

    getDownloadURL(node: CloudNode): string;
    getExportURL(node: CloudNode): string;
    getFilePreviewImageURL(node: CloudNode): string;

    startFileUpload(file: File, destination: CloudDirectory): void;
    cancelFileUpload(): void;
    getCurrentFileUpload(): Observable<Upload>;

    refreshNeeded(): Observable<void>;
}