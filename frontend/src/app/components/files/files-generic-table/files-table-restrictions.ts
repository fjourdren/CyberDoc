import { CloudNode } from 'src/app/models/files-api-models';

export const NO_RESTRICTIONS: FilesTableRestrictions = {
    isSelectable: (_node: CloudNode) => true,
    isReadOnly: (_node: CloudNode) => false,
    isDisabled: (_node: CloudNode) => false,
    isContextAndBottomSheetDisabled: (_node: CloudNode) => false
}

export interface FilesTableRestrictions {
    isSelectable: (node: CloudNode) => boolean;
    isReadOnly: (node: CloudNode) => boolean;
    isDisabled: (node: CloudNode) => boolean;
    isContextAndBottomSheetDisabled: (node: CloudNode) => boolean;
}