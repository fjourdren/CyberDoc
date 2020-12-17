import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ShareMode } from 'src/schemas/file.schema';

export class EditFileMetadataDto {
  @ApiProperty({ description: 'File name', example: 'my_file.pdf' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Directory ID which contains the file',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @IsOptional()
  @IsUUID('4')
  directoryID: string;

  @ApiProperty({ description: 'Is file preview enabled', example: true })
  @IsOptional()
  @IsBoolean()
  preview: boolean;

  @ApiProperty({
    description: 'Share mode',
    example: ShareMode.READONLY,
    enum: [ShareMode.READONLY, ShareMode.READWRITE],
  })
  @IsOptional()
  @IsEnum(ShareMode)
  shareMode: ShareMode;
}
