import { ApiProperty } from '@nestjs/swagger';
import { FileType } from 'src/files/file-types';

export class FileSearchDto {
  @ApiProperty({
    description: 'Find files which name starts with this value (insensitive)',
    example: 'my_file.pdf',
  })
  name: string;

  @ApiProperty({
    description: 'Find files of a specific type',
    example: FileType.Audio,
    enum: [
      FileType.Archive,
      FileType.Audio,
      FileType.Document,
      FileType.Document,
      FileType.Folder,
      FileType.Image,
      FileType.PDF,
      FileType.Presentation,
      FileType.Spreadsheet,
      FileType.Text,
      FileType.Unknown,
      FileType.Video,
    ],
  })
  type: FileType;

  @ApiProperty({
    description:
      'Select only files which start modification date is before this value',
    example: new Date(),
  })
  startLastModifiedDate: Date;

  @ApiProperty({
    description:
      'Select only files which last modification date is before this value',
    example: new Date(),
  })
  endLastModifiedDate: Date;

  @ApiProperty({
    description:
      'Select only files which contains a tag which specified in this list',
    example: ['f3f36d40-4785-198f-e4a6-2cef906c2aeb'],
  })
  tagIDs: string[];
}
