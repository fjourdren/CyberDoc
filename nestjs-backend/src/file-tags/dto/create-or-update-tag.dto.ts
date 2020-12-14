import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty } from 'class-validator';

export class CreateOrUpdateTagDto {

  @ApiProperty({ description: "Tag name", example: "MyTag" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Tag hex color", example: "#eeeeee" })
  @IsNotEmpty()
  @IsHexColor()
  color: string;
}
