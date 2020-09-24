import { Injectable } from '@angular/core';
import { FileSystem } from 'src/app/services/filesystems/file-system'
import { MockFileSystem } from 'src/app/services/filesystems/mock-file-system'

@Injectable({
    providedIn: 'root'
})
export class FileSystemProviderService {
    _default: FileSystem;

    constructor(){
        this._default = new MockFileSystem();
    }

    default(): FileSystem {
        return this._default;
    }
}