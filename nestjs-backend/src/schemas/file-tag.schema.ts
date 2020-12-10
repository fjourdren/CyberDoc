import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class FileTag {
    @Prop()
    _id: string;

    @Prop({unique: true})
    name: string;

    @Prop()
    hexColor: string;
}