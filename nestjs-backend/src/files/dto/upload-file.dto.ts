import { IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  mimetype: string;

  @IsNotEmpty()
  folderID: string;
}
