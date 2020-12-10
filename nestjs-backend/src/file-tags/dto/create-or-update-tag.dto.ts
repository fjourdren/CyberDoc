import { IsHexColor, IsNotEmpty } from 'class-validator';

export class CreateOrUpdateTagDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsHexColor()
  color: string;
}
