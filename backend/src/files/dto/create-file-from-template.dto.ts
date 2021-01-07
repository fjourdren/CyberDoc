import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFileFromTemplateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'File name', example: 'my_file.pdf' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Template ID', example: 'empty_txt' })
  templateID: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Directory ID which contains the file',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  folderID: string;
}
