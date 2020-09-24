import { CloudNode } from 'src/app/models/files-api-models';

export interface FilesTableRestrictions {
    isSelectable: (node: CloudNode) => boolean;
    isReadOnly: (node: CloudNode) => boolean;
    isDisabled: (node: CloudNode) => boolean;
    isContextAndBottomSheetDisabled: (node: CloudNode) => boolean;
}