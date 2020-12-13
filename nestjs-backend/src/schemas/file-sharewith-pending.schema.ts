import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class SharedWithPending {
    @Prop({unique: true})
    email: string;

    file_aes_key: string;
}