import { Observable } from 'rxjs';
import { CloudDirectory, CloudFile, CloudNode, FileTag, RespondShare, SearchParams } from 'src/app/models/files-api-models';

export interface Upload {
    filename: string;
    progress: number;
    remainingSeconds: number;
}

export interface FileSystem {

    get(nodeID: string): Observable<CloudNode>;
    createDirectory(name: string, parentFolder: CloudDirectory): Observable<void>;
    search(searchParams: SearchParams): Observable<CloudDirectory>;

    copy(file: CloudFile, fileName: string, destination: CloudDirectory): Observable<void>;
    move(node: CloudNode, destination: CloudDirectory): Observable<void>;
    rename(node: CloudNode, newName: string): Observable<void>;
    delete(node: CloudNode): Observable<void>;
    setPreviewEnabled(file: CloudFile, enabled: boolean): Observable<void>;
    setShareMode(file: CloudFile, shareMode: string): Observable<void>;

    share(fileID: string, email: String): Observable<void>;
    // MOCK : share(fileID: string, email: String): Observable<RespondShare>;
    getSharedWith(fileID: String): Observable<RespondShare[]>;
    getSharedFiles(): Observable<CloudDirectory>;
    getSharedWithPending(fileID: String): Observable<string[]>;
    deleteShare(fileID: string, email: String): Observable<void>;
  
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