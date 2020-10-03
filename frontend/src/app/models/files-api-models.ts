export const DIRECTORY_MIMETYPE = "application/x-dir";
export type PathItem = {
    name: string;
    id: string;
}

export type CloudNode = CloudFile | CloudDirectory;

export class CloudFile {
    public id: string;
    public ownerName: string;
    public name: string;
    public mimetype: Exclude<string, "application/x-dir">;
    public size: number;
    public lastModified: Date;
    public tagIDs: string[];
    isDirectory: false;
}

export class CloudDirectory {
    public id: string;
    public ownerName: string;
    public name: string;
    public mimetype: "application/x-dir";
    public path: PathItem[];
    public directoryContent: CloudNode[];
    public tagIDs: string[];
    isDirectory: true;
}

