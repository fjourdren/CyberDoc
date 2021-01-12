import { FileType } from '../services/files-utils/files-utils.service';

export class FileTag {
  public _id: string;
  public name: string;
  public hexColor: string;
}

export type PathItem = {
  name: string;
  id: string;
};

export type CloudNode = CloudFile | CloudDirectory;

export class CloudFile {
  public _id: string;
  public owner_id: string;
  public ownerName: string;
  public name: string;
  public mimetype: Exclude<string, 'application/x-dir'>;
  public size: number;
  public updated_at: Date;
  public tags: FileTag[];
  public preview: boolean;
  isDirectory: false;
  public shareMode: 'readonly' | 'readwrite';
}

export class CloudDirectory {
  public _id: string;
  public owner_id: string;
  public ownerName: string;
  public name: string;
  public mimetype: 'application/x-dir';
  public path: PathItem[];
  public directoryContent: CloudNode[];
  public tags: FileTag[];
  public preview: false;
  isDirectory: true;
}

export interface RespondShare {
  name: string;
  email: string;
}

export interface RespondSign {
  name: string;
  email: string;
  date: string;
}

export interface RespondAnswerSign {
  user_email: string;
  created_at: string;
  diggest: string;
}

export const NO_TYPE_FILTER = FileType.Unknown;
export const NO_DATEDIFF_DEFAULT = -1;
export const VALID_DATEDIFF_VALUES = [-1, 0, 1, 7, 30, 60, 90, 365];
export const NO_NAME_FILTER = '';

export const EMPTY_SEARCH_PARAMS: SearchParams = {
  name: NO_NAME_FILTER,
  type: NO_TYPE_FILTER,
  dateDiff: NO_DATEDIFF_DEFAULT,
  tagIDs: [],
};

export interface SearchParams {
  name: string;
  type: FileType;
  dateDiff: number;
  tagIDs: string[];
}

export function isValidSearchParams(obj: any, userTagIDs: string[]) {
  if (typeof obj !== 'object') return false;

  const objKeys = Object.keys(obj);
  if (objKeys.length !== 4) return false;
  if (objKeys.indexOf('name') === -1) return false;
  if (objKeys.indexOf('type') === -1) return false;
  if (objKeys.indexOf('dateDiff') === -1) return false;
  if (objKeys.indexOf('tagIDs') === -1) return false;

  if (typeof obj.name !== 'string') return false;
  if ([NO_TYPE_FILTER, ...Object.keys(FileType)].indexOf(obj.type) === -1)
    return false;
  if (VALID_DATEDIFF_VALUES.indexOf(obj.dateDiff) === -1) return false;
  if (!Array.isArray(obj.tagIDs)) return false;

  for (const item of obj.tagIDs) {
    if (userTagIDs.indexOf(item) === -1) return false;
  }

  return true;
}
