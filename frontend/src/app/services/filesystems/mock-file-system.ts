import { Observable } from 'rxjs';
import { FileSystem, Upload } from './file-system';
import { of, } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CloudDirectory, CloudFile, CloudNode, PathItem } from 'src/app/models/files-api-models';
import { EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

interface InternalFileElement {
    parentID?: string;
    id: string;
    name: string
    date?: Date;
    mimetype: string;
    size?: number;
}

const UPLOAD_SPEED = 5000 * 1000; //5mo/s
const DELAY = 500;
const OWNER = "John Doe"
const DIRECTORY_MIMETYPE = "application/x-dir";

export class MockFileSystem implements FileSystem {

    private filesMap = new Map<string, InternalFileElement>();
    private _refreshNeeded$ = new EventEmitter<void>();
    private _currentUpload$ = new EventEmitter<Upload>();
    private _uploadCancelRequested = false;

    constructor() {
        this.filesMap.set("root", { "name": "Root", "mimetype": DIRECTORY_MIMETYPE, id: "root" });
        this.filesMap.set("root.sub1", { "parentID": "root", "name": "sub1", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1" });
        this.filesMap.set("root.sub2", { "parentID": "root", "name": "sub2", mimetype: DIRECTORY_MIMETYPE, id: "root.sub2" });
        this.filesMap.set("root.sub3", { "parentID": "root", "name": "sub3", mimetype: DIRECTORY_MIMETYPE, id: "root.sub3" });
        this.filesMap.set("root.sub4", { "parentID": "root", "name": "sub4", mimetype: DIRECTORY_MIMETYPE, id: "root.sub4" });
        this.filesMap.set("root.sub1.sub", { "parentID": "root.sub1", "name": "subsub", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1.sub" });

        this.filesMap.set("root.f1", { "parentID": "root", name: "file1A.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.f1" });
        this.filesMap.set("root.f2", { "parentID": "root", name: "file2A.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.f2" });
        this.filesMap.set("root.f3", { "parentID": "root", name: "file3A.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.f3" });

        this.filesMap.set("root.sub1.f1", { "parentID": "root.sub1", name: "file1B.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f1" });
        this.filesMap.set("root.sub1.f2", { "parentID": "root.sub1", name: "file2B.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f2" });
        this.filesMap.set("root.sub1.f3", { "parentID": "root.sub1", name: "file3B.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f3" });

        this.filesMap.set("root.sub1.sub.f1", { "parentID": "root.sub1.sub", name: "file1C.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.sub.f1" });
        this.filesMap.set("root.sub1.sub.f2", { "parentID": "root.sub1.sub", name: "file2C.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.sub.f2" });
        this.filesMap.set("root.sub1.sub.f3", { "parentID": "root.sub1.sub", name: "file3C.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.sub.f3" });
    }

    getFilePreviewImageURL(fileID: string): string {
        return `https://via.placeholder.com/300x200`;
    }

    getDownloadURL(fileID: string): string {
        return `/fake-download-url/${fileID}`;
    }

    createDirectory(name: string, parentFolderID: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const parentFolder = this._ensureFileExists(parentFolderID, true);
            let newEntry: InternalFileElement = {
                id: parentFolder.name + "." + name,
                name: name,
                mimetype: DIRECTORY_MIMETYPE,
                size: 0,
                date: new Date(),
                parentID: parentFolderID
            }

            this.filesMap.set(newEntry.id, newEntry);
            this._refreshNeeded$.emit(null);
        }));
    }

    cancelFileUpload() {
        this._uploadCancelRequested = true;
        this._currentUpload$.emit(null);
    }

    getCurrentFileUpload(): Observable<Upload> {
        return this._currentUpload$.asObservable();
    }

    refreshNeeded(): Observable<void> {
        return this._refreshNeeded$.asObservable();
    }

    startFileUpload(file: Blob, name: string, mimetype: string, parentFolderID: string): void {
        const parentFolder = this._ensureFileExists(parentFolderID, true);
        let newEntry: InternalFileElement = {
            id: parentFolder.name + "." + name,
            name: name,
            mimetype: mimetype,
            size: file ? file.size : 0,
            date: new Date(),
            parentID: parentFolderID
        }

        this._uploadInternal(name, file.size).then((success) => {
            if (success) {
                this.filesMap.set(newEntry.id, newEntry);
                this._currentUpload$.emit(null);
                this._refreshNeeded$.emit(null);
            }
        });
    }

    get(id: string): Observable<CloudNode> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalFile = this._ensureFileExists(id);
            let node = { id: internalFile.id, name: internalFile.name, ownerName: OWNER, mimetype: internalFile.mimetype };

            if (internalFile.mimetype === DIRECTORY_MIMETYPE) {
                const content = Array.from(this.filesMap.values()).filter(val => val.parentID === id).map(val => {
                    let node = { id: val.id, name: val.name, ownerName: OWNER, mimetype: val.mimetype }

                    if (val.mimetype === DIRECTORY_MIMETYPE) {
                        return { ...node, directoryContent: [], path: [], mimetype: "application/x-dir", isDirectory: true } as CloudDirectory;
                    } else {
                        return { ...node, size: val.size, lastModified: val.date, isDirectory: false } as CloudFile;
                    }
                });

                let path = [];
                let current = internalFile;
                while (current) {
                    path.push({ name: current.name, id: current.id });
                    if (current.parentID) {
                        current = Array.from(this.filesMap.values()).filter(val => val.id === current.parentID)[0];
                    } else {
                        current = null;
                    }
                }

                path = path.reverse();
                path.pop();

                return { ...node, path: path, directoryContent: content, mimetype: "application/x-dir", isDirectory: true };
            } else {
                return { ...node, size: internalFile.size, lastModified: internalFile.date, isDirectory: false };
            }
        }));
    }

    copy(sourceID: string, newFileName: string, destID: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(sourceID);
            this._ensureFileExists(destID, true);
            this._copyInternal(sourceID, newFileName, destID);
            this._refreshNeeded$.emit(null);
        }));
    }

    move(sourceID: string, destID: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(sourceID);
            this._ensureFileExists(destID, true);
            let file = this.filesMap.get(sourceID);
            file.parentID = destID;
            this.filesMap.set(sourceID, file);
            this._refreshNeeded$.emit(null);
        }));
    }

    rename(fileID: string, newName: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(fileID);
            let file = this.filesMap.get(fileID);
            file.name = newName;
            this.filesMap.set(fileID, file);
            this._refreshNeeded$.emit(null);
        }));
    }

    delete(fileID: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(fileID);
            this._deleteInternal(fileID);
            this._refreshNeeded$.emit(null);
        }));
    }










    private _ensureFileExists(fileID: string, onlyDirectory: boolean = null) {
        if (!this.filesMap.has(fileID)) {
            throw new HttpErrorResponse({
                error: `File with id ${fileID} doesn't exist`,
                statusText: 'NOT FOUND',
                status: 404,
                url: '/fake-url'
            });
        }

        if (onlyDirectory === true) {
            if (this.filesMap.get(fileID).mimetype !== DIRECTORY_MIMETYPE) {
                throw new HttpErrorResponse({
                    error: `BAD REQUEST [notDir]`,
                    statusText: 'BAD REQUEST',
                    status: 400,
                    url: '/fake-url'
                });
            }
        } else if (onlyDirectory === false) {
            if (this.filesMap.get(fileID).mimetype === DIRECTORY_MIMETYPE) {
                throw new HttpErrorResponse({
                    error: `BAD REQUEST [isDir]`,
                    statusText: 'BAD REQUEST',
                    status: 400,
                    url: '/fake-url'
                });
            }
        }

        return this.filesMap.get(fileID);
    }

    private _deleteInternal(fileID: string) {
        const file = this.filesMap.get(fileID);
        if (file.mimetype === DIRECTORY_MIMETYPE) {
            for (const child of Array.from(this.filesMap.values()).filter(val => val.parentID === fileID)) {
                this._deleteInternal(child.id);
            }
        }
        this.filesMap.delete(fileID);
    }

    private _copyInternal(fileID: string, newFileName: string, destID: string) {
        const file = this.filesMap.get(fileID);
        this.filesMap.set(file.id + "_clone", {
            id: file.id + "_clone",
            parentID: destID,
            mimetype: file.mimetype,
            name: newFileName,
            date: file.date,
            size: file.size
        });

        if (file.mimetype === DIRECTORY_MIMETYPE) {
            for (const child of Array.from(this.filesMap.values()).filter(val => val.parentID === fileID)) {
                this._copyInternal(child.id, child.name, file.id + "_clone");
            }
        }
    }

    private async _uploadInternal(name: string, size: number) {
        let remainingTime = (size / UPLOAD_SPEED) + 1;
        let remainingSize = size;
        while (remainingSize > 0) {
            if (this._uploadCancelRequested) {
                this._uploadCancelRequested = false;
                return false;
            }

            this._currentUpload$.emit({
                filename: name,
                progress: 1 - (remainingSize / size),
                remainingSeconds: remainingTime
            });

            remainingSize -= UPLOAD_SPEED;
            remainingTime -= 1;
            await this._wait(1);
        }

        return true;
    }

    private async _wait(seconds: number) {
        return new Promise((resolve, reject) => {
            window.setTimeout(() => resolve(), seconds * 1000);
        })
    }
}