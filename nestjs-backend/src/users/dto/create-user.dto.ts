import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ description: 'User first name', example: 'John' })
  firstname: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastname: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User password', example: 'eV66scN@t5tGG%ND' })
  password: string;

  @ApiProperty({
    description: 'User role',
    example: UserRole.OWNER,
    enum: [UserRole.OWNER, UserRole.COLLABORATOR],
  })
  role: string;
}
