import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty({ description: 'User first name', example: 'John' })
  firstname: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastname: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User password', example: 'eV66scN@t5tGG%ND' })
  password: string;
}
