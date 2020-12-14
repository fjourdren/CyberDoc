import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class FileTag {
    @Prop({ unique: true, required: true })
    _id: string;

    @Prop({ unique: true, required: true })
    name: string;

    @Prop({ required: true })
    hexColor: string;
}