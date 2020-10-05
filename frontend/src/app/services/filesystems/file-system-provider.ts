import { Injectable } from '@angular/core';
import { FileSystem } from 'src/app/services/filesystems/file-system'
import { MockFileSystem } from 'src/app/services/filesystems/mock-file-system'
import { FilesUtilsService } from '../files-utils/files-utils.service';

const DEFAULT_FS_PROVIDER_NAME = "mock";

@Injectable({
    providedIn: 'root'
})
export class FileSystemProvider {
    private _instances = new Map<string, FileSystem>();

    constructor(private fileUtils: FilesUtilsService){}

    default(): FileSystem {
        return this.get(DEFAULT_FS_PROVIDER_NAME);
    }

    get(providerName: string): FileSystem {
        if (!this._instances.has(providerName)){
            this._instances.set(providerName, this._createInstance(providerName));
        }
        return this._instances.get(providerName);
    }

    private _createInstance(providerName: string){
        switch (providerName){
            case "mock":
                return new MockFileSystem(this.fileUtils);
            default:
                throw new Error(`Unknown FS provider : ${providerName}`);
        }
    }
}