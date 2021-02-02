import { ApiProperty } from '@nestjs/swagger';
import { TwoFactorType } from '../two-factor-auth/two-factor-type.enum';
import { IsEnum } from 'class-validator';

export class TwoFactorTypeDto {
  @IsEnum(TwoFactorType)
  @ApiProperty({
    description: '2FA type',
    enum: TwoFactorType,
  })
  type: TwoFactorType;
}
