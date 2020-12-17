import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SharedWithPending {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  file_aes_key: string;
}
