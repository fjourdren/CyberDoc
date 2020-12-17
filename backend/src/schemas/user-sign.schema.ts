import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class UserSign {
  @Prop({ required: true })
  user_email: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  diggest: string;
}
