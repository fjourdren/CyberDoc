import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SharedWithPending } from './file-sharewith-pending.schema';
import { FileTag } from './file-tag.schema';

export type FileDocument = File & Document;
export const FOLDER = 0;
export const FILE = 1;

export enum ShareMode {
    READONLY = "readonly",
    READWRITE = "readwrite"
}


@Schema({ collection: "File" })
export class File {
    @Prop()
    _id: string;

    @Prop()
    name: string;

    @Prop()
    mimetype: string;

    @Prop()
    size: number;

    @Prop({
        required: true,
        enum: [FOLDER, FILE]
    })
    type: number;

    @Prop([FileTag])
    tags: FileTag[]

    @Prop({
        required: true,
        enum: [ShareMode.READONLY, ShareMode.READWRITE]
    })
    shareMode: string;

    @Prop([String])
    sharedWith: string[];

    @Prop([SharedWithPending])
    shareWithPending: SharedWithPending[];

    @Prop()
    parent_file_id: string;

    @Prop()
    document_id: string;

    @Prop()
    owner_id: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
