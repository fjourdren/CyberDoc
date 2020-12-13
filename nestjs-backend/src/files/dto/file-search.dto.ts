import { FileType } from "src/file-types";

export class FileSearchDto {
  name: string;
  type: FileType;
  startLastModifiedDate: Date;
  endLastModifiedDate: Date;
  tagIDs: string[];
}
