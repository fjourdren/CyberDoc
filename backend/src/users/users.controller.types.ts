import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/generic-response.interceptor';
import { FileTag } from 'src/schemas/file-tag.schema';
import { UserRole } from 'src/schemas/user.schema';
import { VALID_THEMES } from './is-valid-theme.decorator';
import { Subscription } from '../billing/billing.controller.types';

//see UserService -> COLUMNS_TO_KEEP_FOR_USER
export class UserInResponse {
  @ApiProperty({
    description: 'File ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  _id: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstname: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastname: string;

  @ApiProperty({ description: 'User email', example: 'mail@example.com' })
  email: string;

  @ApiProperty({
    description: 'Root directory ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  directory_id: string;

  @ApiProperty({ description: 'File mimetype', type: [FileTag] })
  tags: FileTag[];

  @ApiProperty({
    description: 'User role',
    example: UserRole.OWNER,
    enum: [UserRole.OWNER, UserRole.COLLABORATOR],
  })
  role: string;

  @ApiProperty({
    description: 'User theme',
    example: 'indigo-pink',
    enum: VALID_THEMES,
  })
  theme: string;

  @ApiProperty({
    description: 'Subscription info for user',
    type: Subscription,
  })
  subscription: Subscription;

  @ApiProperty({ description: 'Used space, in bytes', example: 888 })
  usedSpace: number;

  @ApiProperty({ description: 'Available space, in bytes', example: 888 })
  availableSpace: number;
}

export class GetProfileResponse extends GenericResponse {
  @ApiProperty({ description: 'Current user', type: UserInResponse })
  user: UserInResponse;
}
