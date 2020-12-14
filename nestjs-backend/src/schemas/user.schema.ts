import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FileTag } from './file-tag.schema';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class UserFileKey {
    @Prop({ unique: true, required: true })
    file_id: string;

    @Prop({ required: true })
    encryption_file_key: string;
}

@Schema({ _id: false })
export class UserKeys {
    @Prop({ unique: true, required: true })
    public_key: string;

    @Prop({ required: true })
    encrypted_private_key: string;
}

@Schema({ collection: "User" })
export class User {
    @Prop({ unique: true, required: true })
    _id: string;

    @Prop({ required: true })
    firstname: string;

    @Prop({ required: true })
    lastname: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    directory_id: string;

    @Prop({ type: UserKeys, required: true })
    userKeys: UserKeys;

    @Prop([UserFileKey])
    filesKeys: UserFileKey[];

    @Prop([FileTag])
    tags: FileTag[];
}

export const UserSchema = SchemaFactory.createForClass(User);
