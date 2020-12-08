import { IsNotEmpty } from 'class-validator';

export class CopyFileDto {
  @IsNotEmpty()
  copyFileName: string;

  @IsNotEmpty()
  destID: string;
}
