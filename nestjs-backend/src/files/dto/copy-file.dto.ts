import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CopyFileDto {
  @ApiProperty({ description: 'Copy file name', example: 'my_file.pdf' })
  @IsNotEmpty()
  @IsString()
  copyFileName: string;

  @ApiProperty({
    description: 'Directory ID which contains the copy',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @IsNotEmpty()
  @IsUUID('4')
  destID: string;
}
