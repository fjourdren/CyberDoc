import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserSign {
    @Prop({unique: true})
    user_email: string;

    @Prop()
    created_at: Date;

    @Prop()
    diggest: string;
}