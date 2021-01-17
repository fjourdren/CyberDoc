import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import { FileTag } from 'src/schemas/file-tag.schema';
import { ShareMode } from 'src/schemas/file.schema';

export class FileInResponse {
  @ApiProperty({
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  _id: string;

  @ApiProperty({ description: 'File name', example: 'my_file.pdf' })
  name: string;

  @ApiProperty({ description: 'File mimetype', example: 'application/pdf' })
  mimetype: string;

  @ApiProperty({ description: 'File size (null for a folder)', example: 666 })
  size: number;

  @ApiProperty({ description: 'File last update date', example: new Date() })
  updated_at: Date;

  @ApiProperty({ description: 'File creation date', example: new Date() })
  created_at: Date;

  @ApiProperty({ description: 'File tags', type: [FileTag] })
  tags: FileTag[];

  @ApiProperty({ description: 'Is file preview enabled', example: true })
  preview: boolean;

  @ApiProperty({
    description: 'Available rights for current user',
    enum: ['none', 'read', 'write', 'owner'],
    enumName: 'FileAcl',
  })
  access: string;

  @ApiProperty({
    description: 'Email of users who have signed this file',
    type: [String],
    example: ['email@example.com'],
  })
  signs: string[];

  @ApiProperty({
    description: 'File share mode',
    example: ShareMode.READONLY,
    enum: [ShareMode.READONLY, ShareMode.READWRITE],
  })
  shareMode: ShareMode;
}

export class FolderBreadcrumbPathItem {
  @ApiProperty({
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  id: string;

  @ApiProperty({ description: 'File name', example: 'MyFolder' })
  name: string;
}

export class DirectoryProperties extends FileInResponse {
  @ApiProperty({
    description: 'Folder content (null for a file)',
    type: FileInResponse,
  })
  directoryContent: FileInResponse;

  @ApiProperty({
    description: 'Folder breadcrumb path (null for a file)',
    type: [FolderBreadcrumbPathItem],
  })
  path: FolderBreadcrumbPathItem[];
}

export class GetResponse extends GenericResponse {
  @ApiProperty({ description: 'File' })
  content: DirectoryProperties;
}

export class GetFileResponse extends GenericResponse {
  @ApiProperty({
    description: 'File info',
  })
  file: FileInResponse;
}

export class SearchFilesResponse extends GenericResponse {
  @ApiProperty({ description: 'Files', type: [FileInResponse] })
  results: FileInResponse[];
}

export class CreateFileResponse extends GenericResponse {
  @ApiProperty({
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  fileID: string;
}
