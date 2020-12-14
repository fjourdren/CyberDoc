import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SharedWithPending } from './file-sharewith-pending.schema';
import { FileTag } from './file-tag.schema';
import { UserSign } from './user-sign.schema';

export type FileDocument = File & Document;
export const FOLDER = 0;
export const FILE = 1;

export enum ShareMode {
    READONLY = "readonly",
    READWRITE = "readwrite"
}


@Schema({ collection: "File" })
export class File {
    @Prop({ unique: true, required: true })
    _id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    mimetype: string;

    @Prop()
    size: number;

    @Prop({ required: true })
    preview: boolean;

    @Prop({
        required: true,
        enum: [FOLDER, FILE]
    })
    type: number;

    @Prop({ type: [FileTag], required: true })
    tags: FileTag[]

    @Prop({
        required: true,
        enum: [ShareMode.READONLY, ShareMode.READWRITE]
    })
    shareMode: string;

    @Prop({ type: [String], required: true })
    sharedWith: string[];

    @Prop({ type: [SharedWithPending], required: true })
    shareWithPending: SharedWithPending[];

    @Prop({ type: [UserSign], required: true })
    signs: UserSign[];

    @Prop({ required: true })
    parent_file_id: string;

    @Prop()
    document_id: string;

    @Prop({ required: true })
    owner_id: string;

    @Prop({ required: true })
    updated_at: Date;

    @Prop({ required: true })
    created_at: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
