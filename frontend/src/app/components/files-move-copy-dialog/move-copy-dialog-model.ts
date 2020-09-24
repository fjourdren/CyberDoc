import { CloudNode } from 'src/app/models/files-api-models';

export class MoveCopyDialogModel {
    constructor(public node: CloudNode,
         public initialDirID: string,
         public copy: boolean) {}
}