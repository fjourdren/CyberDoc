import { Observable } from 'rxjs';
import { FileSystem, Upload } from './file-system';
import { of, } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CloudDirectory, CloudFile, CloudNode, PathItem, SearchParams } from 'src/app/models/files-api-models';
import { EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FilesUtilsService, FileType } from '../files-utils/files-utils.service';

interface InternalFileElement {
    parentID?: string;
    id: string;
    name: string
    date?: Date;
    mimetype: string;
    size?: number;
    tagsIDs: string[];
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

    constructor(private fileUtils: FilesUtilsService) {
        this._load();
    }

    getFilePreviewImageURL(fileID: string): string {
        return `https://via.placeholder.com/300x200`;
    }

    getDownloadURL(fileID: string): string {
        return `/fake-download-url/${fileID}`;
    }

    getExportURL(fileID: string): string {
        return `/fake-export-url/${fileID}`;
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
                parentID: parentFolderID,
                tagsIDs: [],
            }

            this.filesMap.set(newEntry.id, newEntry);
            this._save();
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
            parentID: parentFolderID,
            tagsIDs: [],
        }

        this._uploadInternal(name, file.size).then((success) => {
            if (success) {
                this.filesMap.set(newEntry.id, newEntry);
                this._currentUpload$.emit(null);
                this._refreshNeeded$.emit(null);
                this._save();
            }
        });
    }

    search(searchParams: SearchParams): Observable<CloudDirectory> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            let directory: CloudDirectory = {
                id: "tmp",
                mimetype: "application/x-dir",
                name: "Search results",
                ownerName: "NOBODY",
                tagIDs: [],
                path: [],
                directoryContent: [],
                isDirectory: true
            }

            let nodes: InternalFileElement[] = Array.from(this.filesMap.values());
            
            nodes = nodes.filter(node => node.name.startsWith(searchParams.name));
            
            if (searchParams.type !== "any"){
                nodes = nodes.filter(node => this.fileUtils.getFileTypeForMimetype(node.mimetype) === FileType[searchParams.type]) ;
            }

            //date is not implemented !
            nodes = nodes.filter(node => {
                for (const tagID of searchParams.tagIDs) {
                    if (node.tagsIDs.indexOf(tagID) === -1) return false;
                }
                return true;
            })
            
            directory.directoryContent = nodes.map(val => {
                let node = { id: val.id, name: val.name, ownerName: OWNER, mimetype: val.mimetype }

                if (val.mimetype === DIRECTORY_MIMETYPE) {
                    return { ...node, directoryContent: [], path: [], mimetype: "application/x-dir", isDirectory: true, tagIDs: val.tagsIDs } as CloudDirectory;
                } else {
                    return { ...node, size: val.size, lastModified: val.date, isDirectory: false, tagIDs: val.tagsIDs } as CloudFile;
                }
            })
            

            return directory;
        }));
    }


    get(id: string): Observable<CloudNode> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalFile = this._ensureFileExists(id);
            let node = { id: internalFile.id, name: internalFile.name, ownerName: OWNER, mimetype: internalFile.mimetype };

            if (internalFile.mimetype === DIRECTORY_MIMETYPE) {
                const content = Array.from(this.filesMap.values()).filter(val => val.parentID === id).map(val => {
                    let node = { id: val.id, name: val.name, ownerName: OWNER, mimetype: val.mimetype }

                    if (val.mimetype === DIRECTORY_MIMETYPE) {
                        return { ...node, directoryContent: [], path: [], mimetype: "application/x-dir", isDirectory: true, tagIDs: val.tagsIDs } as CloudDirectory;
                    } else {
                        return { ...node, size: val.size, lastModified: val.date, isDirectory: false, tagIDs: val.tagsIDs } as CloudFile;
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

                this._save();
                return { ...node, path: path, directoryContent: content, mimetype: "application/x-dir", isDirectory: true, tagIDs: internalFile.tagsIDs };
            } else {
                this._save();
                return { ...node, size: internalFile.size, lastModified: internalFile.date, isDirectory: false, tagIDs: internalFile.tagsIDs };
            }
        }));
    }

    copy(sourceID: string, newFileName: string, destID: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(sourceID);
            this._ensureFileExists(destID, true);
            this._copyInternal(sourceID, newFileName, destID);
            this._save();
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
            this._save();
            this._refreshNeeded$.emit(null);
        }));
    }

    rename(fileID: string, newName: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(fileID);
            let file = this.filesMap.get(fileID);
            file.name = newName;
            this.filesMap.set(fileID, file);
            this._save();
            this._refreshNeeded$.emit(null);
        }));
    }

    editTags(fileID: string, tagIDs: string[]): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(fileID);
            let file = this.filesMap.get(fileID);
            file.tagsIDs = tagIDs;
            this.filesMap.set(fileID, file);
            this._save();
            this._refreshNeeded$.emit(null);
        }));
    }

    delete(fileID: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._ensureFileExists(fileID);
            this._deleteInternal(fileID);
            this._save();
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
            size: file.size,
            tagsIDs: file.tagsIDs,
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

    private _save() {
        localStorage.setItem("__filesMap", JSON.stringify(Array.from(this.filesMap.entries())))
    }

    private _load() {
        this.filesMap = new Map(JSON.parse(localStorage.getItem("__filesMap")));
        if (!this.filesMap || this.filesMap.size === 0) {
            this.filesMap.set("other.root", { "name": "My safe", "mimetype": DIRECTORY_MIMETYPE, id: "other.root", tagsIDs: [] })
            this.filesMap.set("root", { "name": "My safe", "mimetype": DIRECTORY_MIMETYPE, id: "root", tagsIDs: [] });
            this.filesMap.set("root.sub1", { "parentID": "root", "name": "Documents", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1", tagsIDs: [] });
            this.filesMap.set("root.sub2", { "parentID": "root", "name": "Videos", mimetype: DIRECTORY_MIMETYPE, id: "root.sub2", tagsIDs: [] });
            this.filesMap.set("root.sub3", { "parentID": "root", "name": "Pictures", mimetype: DIRECTORY_MIMETYPE, id: "root.sub3", tagsIDs: [] });
            this.filesMap.set("root.sub4", { "parentID": "root", "name": "Others", mimetype: DIRECTORY_MIMETYPE, id: "root.sub4", tagsIDs: [] });
            this.filesMap.set("root.sub1.sub", { "parentID": "root.sub1", "name": "Bills", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1.sub", tagsIDs: [] });

            this.filesMap.set("root.f1", { "parentID": "root", name: "my_image.png", mimetype: "image/png", size: 2316471, date: new Date(), id: "root.f1", tagsIDs: [] });
            this.filesMap.set("root.f2", { "parentID": "root", name: "my_video.mp4", mimetype: "video/mp4", size: 29904561, date: new Date(), id: "root.f2", tagsIDs: [] });
            this.filesMap.set("root.f3", { "parentID": "root", name: "my_audio.mp3", mimetype: "audio/mp3", size: 4404561, date: new Date(), id: "root.f3", tagsIDs: [] });

            this.filesMap.set("root.sub1.f1", { "parentID": "root.sub1", name: "mydoc01.pdf", mimetype: "application/pdf", size: 846, date: new Date(), id: "root.sub1.f1", tagsIDs: [] });
            this.filesMap.set("root.sub1.f2", { "parentID": "root.sub1", name: "mydoc02.pdf", mimetype: "application/pdf", size: 964, date: new Date(), id: "root.sub1.f2", tagsIDs: [] });
            this.filesMap.set("root.sub1.f3", { "parentID": "root.sub1", name: "mydoc03.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f3", tagsIDs: [] });

            this.filesMap.set("root.sub1.sub.f1", { "parentID": "root.sub1.sub", name: "bill01.pdf", mimetype: "application/pdf", size: 368, date: new Date(), id: "root.sub1.sub.f1", tagsIDs: [] });
            this.filesMap.set("root.sub1.sub.f2", { "parentID": "root.sub1.sub", name: "bill02.pdf", mimetype: "application/pdf", size: 216, date: new Date(), id: "root.sub1.sub.f2", tagsIDs: [] });
            this.filesMap.set("root.sub1.sub.f3", { "parentID": "root.sub1.sub", name: "bill03.pdf", mimetype: "application/pdf", size: 698, date: new Date(), id: "root.sub1.sub.f3", tagsIDs: [] });
            this._save();
        }
    }
}