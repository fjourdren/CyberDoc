import { Prop, Schema } from '@nestjs/mongoose';

@Schema({})
export class FileTag {
    @Prop({ unique: true, required: true })
    _id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    hexColor: string;
}