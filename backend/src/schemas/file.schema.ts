import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SharedWithPending } from './file-sharewith-pending.schema';
import { FileTag } from './file-tag.schema';
import { UserSign } from './user-sign.schema';
import * as mongooseTimestamp from 'mongoose-timestamp';

export type FileDocument = File & Document;
export const FOLDER = 0;
export const FILE = 1;

export enum ShareMode {
  READONLY = 'readonly',
  READWRITE = 'readwrite',
}

@Schema({ collection: 'File', autoCreate: true, autoIndex: true })
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
    enum: [FOLDER, FILE],
  })
  type: number;

  @Prop([FileTag])
  tags: FileTag[];

  @Prop({
    required: true,
    enum: [ShareMode.READONLY, ShareMode.READWRITE],
  })
  shareMode: string;

  @Prop([String])
  sharedWith: string[];

  @Prop([SharedWithPending])
  shareWithPending: SharedWithPending[];

  @Prop([UserSign])
  signs: UserSign[];

  @Prop()
  parent_file_id: string;

  @Prop()
  document_id: string;

  @Prop({ required: true })
  owner_id: string;

  updated_at: Date;
  created_at: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.plugin(mongooseTimestamp, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
