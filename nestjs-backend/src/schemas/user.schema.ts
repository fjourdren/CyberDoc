import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FileTag } from './file-tag.schema';

export type UserDocument = User & Document;

@Schema()
export class UserFileKey {
    @Prop()
    file_id: string;

    @Prop()
    encryption_file_key: string;
}

@Schema()
export class UserKeys {
    @Prop()
    public_key: string;

    @Prop()
    encrypted_private_key: string;
}

@Schema({ collection: "User" })
export class User {
    @Prop()
    _id: string;

    @Prop()
    firstname: string;

    @Prop()
    lastname: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    directory_id: string;

    @Prop(UserKeys)
    userKeys: UserKeys;

    @Prop([UserFileKey])
    filesKeys: UserFileKey[]

    @Prop([FileTag])
    tags: FileTag[]
}

export const UserSchema = SchemaFactory.createForClass(User);
