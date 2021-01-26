import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TerminateSessionDto {
  @ApiProperty({
    description: 'Hashed JWT',
    example:
      '9497b46eb40a3d2e050d110b94abefa90d335854f5e7e5a68c2fba9edc1ec8e1de8a53b98d9ebc1634a61cf047e8633ad20c35329e9e5bc8c12593402a1f0c85',
  })
  @IsNotEmpty()
  @IsString()
  hashedJWT: string;
}
