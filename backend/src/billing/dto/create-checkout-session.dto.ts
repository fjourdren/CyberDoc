import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Plan ID', example: 'plan1_month' })
  @IsNotEmpty()
  @IsString()
  planId: string;
}
