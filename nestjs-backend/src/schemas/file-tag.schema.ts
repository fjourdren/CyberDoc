import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({})
export class FileTag {
    @Prop({ unique: true, required: true })
    @ApiProperty({ description: "Tag ID", example: "f3f36d40-4785-198f-e4a6-2cef906c2aeb" })
    _id: string;

    @Prop({ required: true })
    @ApiProperty({ description: "Tag name", example: "MyTag" })
    name: string;

    @Prop({ required: true })
    @ApiProperty({ description: "Tag hex color", example: "#eeeeee" })
    hexColor: string;
}