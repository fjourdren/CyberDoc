import { ApiProperty } from '@nestjs/swagger';
import { IsMimeType, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UploadFileDto {
  //Hack to see upfile field in Swagger Doc
  @ApiProperty({
    type: 'file',
    name: 'upfile',
    description: 'File content',
    required: false,
  })
  __c44a63d0_9437_45fd_ad01_82e6831f9912: never;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'File name', example: 'my_file.pdf' })
  name: string;

  @IsNotEmpty()
  @IsMimeType()
  @ApiProperty({ description: 'File mimetype', example: 'application/pdf' })
  mimetype: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'Directory ID which contains the file',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  folderID: string;
}
