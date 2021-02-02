import { ApiProperty } from '@nestjs/swagger';
import { TwoFactorType } from '../two-factor-auth/two-factor-type.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorTypeAndTokenDto {
  @IsEnum(TwoFactorType)
  @ApiProperty({
    description: '2FA type',
    enum: TwoFactorType,
  })
  type: TwoFactorType;

  @ApiProperty({
    description:
      'Two-Factor token generated/received (depends on the specified type)',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  twoFactorToken: string;
}
