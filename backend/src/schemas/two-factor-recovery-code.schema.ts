import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({})
export class TwoFactorRecoveryCode {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Two-Factor Recovery Code',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  code: string;

  @Prop({ required: true })
  @ApiProperty({ description: 'Is code already used', example: true })
  isValid: boolean;
}
