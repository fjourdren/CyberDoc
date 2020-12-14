import { ShareMode } from "src/schemas/file.schema";

export class EditFileMetadataDto {
  name: string;
  folderID: string;
  preview: boolean;
  shareMode: ShareMode;
}
