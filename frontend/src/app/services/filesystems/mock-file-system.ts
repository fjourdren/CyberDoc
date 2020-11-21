import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CloudNode, CloudDirectory, SearchParams, FileTag, CloudFile, PathItem, RespondShare, RespondSign, RespondAnswerSign } from 'src/app/models/files-api-models';
import { DIRECTORY_MIMETYPE, FilesUtilsService, FileType } from '../files-utils/files-utils.service';
import { FileSystem, Upload } from './file-system';
import { UserServiceProvider } from '../users/user-service-provider'

interface InternalFileElement {
    parentID?: string;
    id: string;
    name: string
    date?: Date;
    mimetype: string;
    size?: number;
    tags: FileTag[];
    sharedWith: RespondShare[];
    sharedWithPending: string[];
    preview: boolean;
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

    setShareMode(file: CloudFile, shareMode: string): Observable<void> {
        console.warn("TODO", "setShareMode", file, shareMode);
        return of(null).pipe(delay(DELAY));
    }

    getFilePreviewImageURL(node: CloudNode): string {
        return `https://via.placeholder.com/300x200`;
    }

    getDownloadURL(node: CloudNode): string {
        return `/fake-download-url/${node._id}`;
    }

    getExportURL(node: CloudNode): string {
        return `/fake-export-url/${node._id}`;
    }

    getEtherpadURL(file: CloudFile): Observable<string> {
        return of(`/fake-etherpadurl/${file._id}`);
    }

    // MOCK
    getSharedWith(id: string): Observable<RespondShare[]>{
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return this.filesMap.get(id).sharedWith;
        }));
    }

    getSharedWithPending(id: string): Observable<string[]>{
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            return this.filesMap.get(id).sharedWithPending;
        }));
    }

    createDirectory(name: string, parentFolder: CloudDirectory): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            let newEntry: InternalFileElement = {
                id: parentFolder.name + "." + name,
                name: name,
                mimetype: DIRECTORY_MIMETYPE,
                size: 0,
                date: new Date(),
                parentID: parentFolder._id,
                tags: [],
                sharedWith: [],
                sharedWithPending: [],
                preview: false
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
            parentID: destination._id,
            tags: [],
            sharedWith: [],
            sharedWithPending: [],
            preview: false
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
                _id: null,
                mimetype: "application/x-dir",
                name: null,
                ownerName: null,
                tags: [],
                path: [],
                directoryContent: [],
                isDirectory: true,
                preview: false
            }

            let nodes: InternalFileElement[] = Array.from(this.filesMap.values());
            nodes = nodes.filter(node => node.name.startsWith(searchParams.name));

            if (searchParams.type !== FileType.Unknown) {
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

    copy(file: CloudFile, fileName: string, destination: CloudDirectory): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._copyInternal(file._id, fileName, destination._id);
            this._save();
        }));
    }

    move(node: CloudNode, destination: CloudDirectory): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node._id);
            internalNode.parentID = destination._id;
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }

    rename(node: CloudNode, newName: string): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node._id);
            internalNode.name = newName;
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }

    addTag(node: CloudNode, tag: FileTag): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node._id);
            internalNode.tags.push(tag);
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }

    removeTag(node: CloudNode, tag: FileTag): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            const internalNode = this.filesMap.get(node._id);
            internalNode.tags = internalNode.tags.filter(val => val._id !== tag._id);
            this.filesMap.set(internalNode.id, internalNode);
            this._save();
        }));
    }
    // TODO : Modifer le share pour ne pas prendre encompte les dossiers.
    share(fileID: string, email: string): Observable<void>{
        let currentFile: InternalFileElement;
        let Respond: RespondShare = {email: "", name:""};
        let test: boolean = false;
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if(email.startsWith("test@gmail.com")){
                throw new HttpErrorResponse({
                    error: `Error`,
                    statusText: 'NOT FOUND',
                    status: 404,
                    url: '/fake-url'
                });
            }
            Respond.email = email;
            Respond.name = "NAME : "+email;
            console.log(Respond.name);
            currentFile = this.filesMap.get(fileID);
            currentFile.sharedWith.forEach(element => {
                if(Respond.email === element.email){
                    const index = currentFile.sharedWith.indexOf(element);
                    if (index > -1) {
                        currentFile.sharedWith.splice(index, 1);
                    }
                    test = true;
                }
            })
            if(test === false){
                currentFile.sharedWith.push(Respond);
            }
            
            this.filesMap.set(currentFile.id, currentFile);
            this._save();
            // Retirer pour mock
            //return Respond;
        }));
    }

    getSharedFiles(): Observable<CloudDirectory> {
        return of(new CloudDirectory());
    }

    deleteShare(fileID: string, email: string): Observable<void>{
        let currentFile: InternalFileElement;
        let Respond: RespondShare = {email: "", name:""};
        let test: boolean = false;
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            if(email.startsWith("flavien.jourdren@gmail.com")){
                throw new HttpErrorResponse({
                    error: `Error`,
                    statusText: 'NOT FOUND',
                    status: 404,
                    url: '/fake-url'
                });
            }
            Respond.email = email;
            Respond.name = "NAME : "+email;
            console.log(Respond.name);
            currentFile = this.filesMap.get(fileID);
            currentFile.sharedWith.forEach(element => {
                if(Respond.email === element.email){
                    const index = currentFile.sharedWith.indexOf(element);
                    if (index > -1) {
                        currentFile.sharedWith.splice(index, 1);
                    }
                    test = true;
                }
            })  
            this.filesMap.set(currentFile.id, currentFile);
            this._save();
            // Retirer pour mock
            //return Respond;
        }));
    }

    sign(fileID: string): Observable<void>{
        return of();
    }

    listSignatories(fileID: string): Observable<RespondAnswerSign[]>{
        return of([]);
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
    delete(node: CloudNode): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            this._deleteInternal(node._id);
            this._save();
        }));
    }

    setPreviewEnabled(file: CloudFile, enabled: boolean): Observable<void> {
        return of(null).pipe(delay(DELAY)).pipe(map(() => {
            console.warn("not implemented setPreviewEnabled mock", file, enabled);
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
            sharedWith: file.sharedWith,
            sharedWithPending: file.sharedWithPending,
            preview: file.preview
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
                remainingSeconds: remainingTime,
                error: undefined
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
                _id: internalNode.id,
                ownerName: OWNER,
                name: internalNode.name,
                mimetype: internalNode.mimetype,
                path: path,
                directoryContent: directoryContent,
                tags: internalNode.tags,
                isDirectory: true,
                preview: false
            } as CloudDirectory;

        } else {
            return {
                _id: internalNode.id,
                ownerName: OWNER,
                name: internalNode.name,
                mimetype: internalNode.mimetype,
                size: internalNode.size,
                updated_at: new Date(),
                tags: internalNode.tags,
                isDirectory: false,
                preview: internalNode.preview
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
            this.filesMap.set("other.root", { "name": "My safe", "mimetype": DIRECTORY_MIMETYPE, id: "other.root", tags: [], sharedWith: [], sharedWithPending: [], preview: false })
            this.filesMap.set("root", { "name": "My safe", "mimetype": DIRECTORY_MIMETYPE, id: "root", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub1", { "parentID": "root", "name": "Documents", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub2", { "parentID": "root", "name": "Videos", mimetype: DIRECTORY_MIMETYPE, id: "root.sub2", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub3", { "parentID": "root", "name": "Pictures", mimetype: DIRECTORY_MIMETYPE, id: "root.sub3", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub4", { "parentID": "root", "name": "Others", mimetype: DIRECTORY_MIMETYPE, id: "root.sub4", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub1.sub", { "parentID": "root.sub1", "name": "Bills", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1.sub", tags: [], sharedWithPending: [], sharedWith: [], preview: false });

            this.filesMap.set("root.f1", { "parentID": "root", name: "my_image.png", mimetype: "image/png", size: 2316471, date: new Date(), id: "root.f1", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.f2", { "parentID": "root", name: "my_video.mp4", mimetype: "video/mp4", size: 29904561, date: new Date(), id: "root.f2", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.f3", { "parentID": "root", name: "my_audio.mp3", mimetype: "audio/mp3", size: 4404561, date: new Date(), id: "root.f3", tags: [], sharedWith: [], sharedWithPending: [], preview: false });

            this.filesMap.set("root.sub1.f1", { "parentID": "root.sub1", name: "mydoc01.pdf", mimetype: "application/pdf", size: 846, date: new Date(), id: "root.sub1.f1", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub1.f2", { "parentID": "root.sub1", name: "mydoc02.pdf", mimetype: "application/pdf", size: 964, date: new Date(), id: "root.sub1.f2", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub1.f3", { "parentID": "root.sub1", name: "mydoc03.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f3", tags: [], sharedWith: [], sharedWithPending: [], preview: false });

            this.filesMap.set("root.sub1.sub.f1", { "parentID": "root.sub1.sub", name: "bill01.pdf", mimetype: "application/pdf", size: 368, date: new Date(), id: "root.sub1.sub.f1", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub1.sub.f2", { "parentID": "root.sub1.sub", name: "bill02.pdf", mimetype: "application/pdf", size: 216, date: new Date(), id: "root.sub1.sub.f2", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this.filesMap.set("root.sub1.sub.f3", { "parentID": "root.sub1.sub", name: "bill03.pdf", mimetype: "application/pdf", size: 698, date: new Date(), id: "root.sub1.sub.f3", tags: [], sharedWith: [], sharedWithPending: [], preview: false });
            this._save();
        }
    }
}