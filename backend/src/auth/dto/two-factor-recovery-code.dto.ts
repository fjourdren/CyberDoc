import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorRecoveryCodeDto {
  @ApiProperty({
    description: 'Two-Factor recovery code',
    example: '86aae0b1-dd25-48ea-b443-1852f2eee3ef',
  })
  @IsNotEmpty()
  @IsString()
  twoFactorRecoveryCode: string;
}
