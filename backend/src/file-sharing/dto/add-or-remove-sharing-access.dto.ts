import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsLowercase, IsNotEmpty } from 'class-validator';

export class AddOrRemoveSharingAccessDto {
  @ApiProperty({
    description: 'User email',
    example: 'email@example.com',
  })
  @IsNotEmpty()
  @IsLowercase()
  @IsEmail()
  email: string;
}
