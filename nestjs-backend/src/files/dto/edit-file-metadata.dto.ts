import { ApiProperty } from "@nestjs/swagger";
import { ShareMode } from "src/schemas/file.schema";

export class EditFileMetadataDto {

  @ApiProperty({ description: "File name", example: "my_file.pdf" })
  name: string;

  @ApiProperty({ description: "Directory ID which contains the file", example: "f3f36d40-4785-198f-e4a6-2cef906c2aeb" })
  folderID: string;

  @ApiProperty({ description: "Is file preview enabled", example: true })
  preview: boolean;

  @ApiProperty({ description: "Share mode", example: ShareMode.READONLY, enum: [ShareMode.READONLY, ShareMode.READWRITE] })
  shareMode: ShareMode;
}
