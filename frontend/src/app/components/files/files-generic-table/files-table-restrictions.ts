import { CloudFile, CloudNode } from 'src/app/models/files-api-models';

export const NO_RESTRICTIONS: FilesTableRestrictions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSelectable: (_node: CloudNode) => true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isReadOnly: (_file: CloudFile) => false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isDisabled: (_node: CloudNode) => false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isContextAndBottomSheetDisabled: (_node: CloudNode) => false,
};

export interface FilesTableRestrictions {
  isSelectable: (node: CloudNode) => boolean;
  isReadOnly: (file: CloudFile) => boolean;
  isDisabled: (node: CloudNode) => boolean;
  isContextAndBottomSheetDisabled: (node: CloudNode) => boolean;
}
