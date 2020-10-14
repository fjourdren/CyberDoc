import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CloudNode, CloudDirectory, SearchParams, FileTag, CloudFile, PathItem } from 'src/app/models/files-api-models';
import { DIRECTORY_MIMETYPE, FilesUtilsService, FileType } from '../files-utils/files-utils.service';
import { FileSystem, Upload } from './file-system';

interface InternalFileElement {
    parentID?: string;
    id: string;
    name: string
    date?: Date;
    mimetype: string;
    size?: number;
    tags: FileTag[];
}

const UPLOAD_SPEED = 5000 * 1000; //5mo/s
const DELAY = 500;
const OWNER = "John Doe"

export class MockFileSystem implements FileSystem {

    private filesMap = new Map<string, InternalFileElement>();
    private _refreshNeeded$ = new EventEmitter<void>();
    private _currentUpload$ = new EventEmitter<Upload>();
    private _uploadCancelRequested = false;

    constructor(private fileUtils: FilesUtilsService) {
        this._load();
    }

    getFilePreviewImageURL(node: CloudNode): string {
        return `https://via.placeholder.com/300x200`;
    }

    getDownloadURL(node: CloudNode): string {
        return `/fake-download-url/${node.id}`;
    }

    getExportURL(node: CloudNode): string {
        return `/fake-export-url/${node.id}`;
    }

    createDirectory(name: string, parentFolder: CloudDirectory): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            let newEntry: InternalFileElement = {
                id: parentFolder.name + "." + name,
                name: name,
                mimetype: DIRECTORY_MIMETYPE,
                size: 0,
                date: new Date(),
                parentID: parentFolder.id,
                tags: [],
            }

            this.filesMap.set(newEntry.id, newEntry);
            this._save();
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

    startFileUpload(file: File, destination: CloudDirectory): void {
        let newEntry: InternalFileElement = {
            id: destination.name + "." + name,
            name: name,
            mimetype: file ? file.type : DIRECTORY_MIMETYPE,
            size: file ? file.size : 0,
            date: new Date(),
            parentID: destination.id,
            tags: [],
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
                name: "tmp",
                ownerName: "tmp",
                tags: [],
                path: [],
                directoryContent: [],
                isDirectory: true
            }

            let nodes: InternalFileElement[] = Array.from(this.filesMap.values());
            nodes = nodes.filter(node => node.name.startsWith(searchParams.name));

            if (searchParams.type !== "any") {
                nodes = nodes.filter(node => this.fileUtils.getFileTypeForMimetype(node.mimetype) === FileType[searchParams.type]);
            }

            //date is not implemented !
            nodes = nodes.filter(node => {
                for (const tagID of searchParams.tagIDs) {
                    if (node.tags.map(tag => tag._id).indexOf(tagID) === -1) return false;
                }
                return true;
            })

            directory.directoryContent = nodes.map(val => this._convertInternalNodeToCloudNode(val));
            return directory;
        }));
    }

    get(nodeID: string): Observable<CloudNode> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if (!this.filesMap.has(nodeID)) {
                throw new HttpErrorResponse({
                    error: `Node with id ${nodeID} doesn't exist`,
                    statusText: 'NOT FOUND',
                    status: 404,
                    url: '/fake-url'
                });
            }

            return this._convertInternalNodeToCloudNode(this.filesMap.get(nodeID));
        }));
    }

    copy(node: CloudNode, fileName: string, destination: CloudDirectory): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._copyInternal(node.id, fileName, destination.id);
            this._save();
        }));
    }

    move(node: CloudNode, destination: CloudDirectory): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node.id);
            internalNode.parentID = destination.id;
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }

    rename(node: CloudNode, newName: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node.id);
            internalNode.name = newName;
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }

    addTag(node: CloudNode, tag: FileTag): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node.id);
            internalNode.tags.push(tag);
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }

    removeTag(node: CloudNode, tag: FileTag): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node.id);
            internalNode.tags = internalNode.tags.filter(val => val._id !== tag._id);
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }

    share(fileID: String, email: string, state:String): Observable<void>{
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._save();
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
    delete(node: CloudNode): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._deleteInternal(node.id);
            this._save();
        }));
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
            tags: file.tags,
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

    private _convertInternalNodeToCloudNode(internalNode: InternalFileElement, fillDirectoryContentAndPath = true): CloudNode {
        if (internalNode.mimetype === DIRECTORY_MIMETYPE) {

            let directoryContent: CloudNode[] = [];
            let path: PathItem[] = [];
            if (fillDirectoryContentAndPath) {
                directoryContent = Array.from(this.filesMap.values()).filter(val => val.parentID === internalNode.id).map(val => {
                    return this._convertInternalNodeToCloudNode(val, false);
                });

                let current = internalNode;
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
            }

            return {
                id: internalNode.id,
                ownerName: OWNER,
                name: internalNode.name,
                mimetype: internalNode.mimetype,
                path: path,
                directoryContent: directoryContent,
                tags: internalNode.tags,
                isDirectory: true
            } as CloudDirectory;

        } else {
            return {
                id: internalNode.id,
                ownerName: OWNER,
                name: internalNode.name,
                mimetype: internalNode.mimetype,
                size: internalNode.size,
                lastModified: new Date(),
                tags: internalNode.tags,
                isDirectory: false
            } as CloudFile;
        }
    }

    private async _wait(seconds: number) {
        return new Promise((resolve, reject) => {
            window.setTimeout(() => resolve(), seconds * 1000);
        })
    }

    private _save() {
        localStorage.setItem("__filesMap", JSON.stringify(Array.from(this.filesMap.entries())))
        this._refreshNeeded$.emit(null);
    }

    private _load() {
        this.filesMap = new Map(JSON.parse(localStorage.getItem("__filesMap")));
        if (!this.filesMap || this.filesMap.size === 0) {
            this.filesMap.set("other.root", { "name": "My safe", "mimetype": DIRECTORY_MIMETYPE, id: "other.root", tags: [] })
            this.filesMap.set("root", { "name": "My safe", "mimetype": DIRECTORY_MIMETYPE, id: "root", tags: [] });
            this.filesMap.set("root.sub1", { "parentID": "root", "name": "Documents", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1", tags: [] });
            this.filesMap.set("root.sub2", { "parentID": "root", "name": "Videos", mimetype: DIRECTORY_MIMETYPE, id: "root.sub2", tags: [] });
            this.filesMap.set("root.sub3", { "parentID": "root", "name": "Pictures", mimetype: DIRECTORY_MIMETYPE, id: "root.sub3", tags: [] });
            this.filesMap.set("root.sub4", { "parentID": "root", "name": "Others", mimetype: DIRECTORY_MIMETYPE, id: "root.sub4", tags: [] });
            this.filesMap.set("root.sub1.sub", { "parentID": "root.sub1", "name": "Bills", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1.sub", tags: [] });

            this.filesMap.set("root.f1", { "parentID": "root", name: "my_image.png", mimetype: "image/png", size: 2316471, date: new Date(), id: "root.f1", tags: [] });
            this.filesMap.set("root.f2", { "parentID": "root", name: "my_video.mp4", mimetype: "video/mp4", size: 29904561, date: new Date(), id: "root.f2", tags: [] });
            this.filesMap.set("root.f3", { "parentID": "root", name: "my_audio.mp3", mimetype: "audio/mp3", size: 4404561, date: new Date(), id: "root.f3", tags: [] });

            this.filesMap.set("root.sub1.f1", { "parentID": "root.sub1", name: "mydoc01.pdf", mimetype: "application/pdf", size: 846, date: new Date(), id: "root.sub1.f1", tags: [] });
            this.filesMap.set("root.sub1.f2", { "parentID": "root.sub1", name: "mydoc02.pdf", mimetype: "application/pdf", size: 964, date: new Date(), id: "root.sub1.f2", tags: [] });
            this.filesMap.set("root.sub1.f3", { "parentID": "root.sub1", name: "mydoc03.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f3", tags: [] });

            this.filesMap.set("root.sub1.sub.f1", { "parentID": "root.sub1.sub", name: "bill01.pdf", mimetype: "application/pdf", size: 368, date: new Date(), id: "root.sub1.sub.f1", tags: [] });
            this.filesMap.set("root.sub1.sub.f2", { "parentID": "root.sub1.sub", name: "bill02.pdf", mimetype: "application/pdf", size: 216, date: new Date(), id: "root.sub1.sub.f2", tags: [] });
            this.filesMap.set("root.sub1.sub.f3", { "parentID": "root.sub1.sub", name: "bill03.pdf", mimetype: "application/pdf", size: 698, date: new Date(), id: "root.sub1.sub.f3", tags: [] });
            this._save();
        }
    }
}