import { IsEnum } from 'class-validator';
import { TwoFactorType } from '../two-factor-auth/two-factor-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SendTokenDto {
  @IsEnum(TwoFactorType)
  @ApiProperty({
    description: '2FA type',
    enum: TwoFactorType,
  })
  type: TwoFactorType;
}
