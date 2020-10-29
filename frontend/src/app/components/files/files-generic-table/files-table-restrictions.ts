import {CloudFile, CloudNode} from 'src/app/models/files-api-models';

export const NO_RESTRICTIONS: FilesTableRestrictions = {
    isSelectable: (_node: CloudNode) => true,
    isReadOnly: (_file: CloudFile) => false,
    isDisabled: (_node: CloudNode) => false,
    isContextAndBottomSheetDisabled: (_node: CloudNode) => false
}

export interface FilesTableRestrictions {
    isSelectable: (node: CloudNode) => boolean;
    isReadOnly: (file: CloudFile) => boolean;
    isDisabled: (node: CloudNode) => boolean;
    isContextAndBottomSheetDisabled: (node: CloudNode) => boolean;
}