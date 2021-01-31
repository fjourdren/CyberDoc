import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ _id: false })
export class UserDevice {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Device name (provided by user)',
    example: 'MyComputer',
  })
  name: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Device OS name (from UserAgent)',
    example: 'Windows 10',
  })
  os: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Device browser name (from UserAgent)',
    example: 'Chrome',
  })
  browser: string;
}
