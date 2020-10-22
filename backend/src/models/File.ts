import mongoose from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import Guid from 'guid';

import ITag, { Tag } from './Tag';


/**
 * File Type enum
 */
export enum FileType {
    DIRECTORY = 0,
    DOCUMENT  = 1
}


/**
 * Building typescript & Mongoose data archs
 */
export const FileSchema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        uniqueCaseInsensitive: true,
        default: () => Guid.raw()
    },
    type: {
		type    : FileType,
		required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    name: {
        type    : String,
        required: true,
        trim    : true
    },
    size: {
        type: Number
    },
    document_id: {
        type: String
    },
    parent_file_id: {
        type     : String
    },
    owner_id: {
		type     : String,
        required : true
    },
    tags: {
        type: [Tag.schema]
    },
    preview: {
        type: Boolean,
        required: true,
        default: true
    },
    updated_at: {
        type   : Date,
        default: new Date().getTime()
    },
    created_at: {
        type   : Date,
        default: new Date().getTime()
    }
},
{
    collection: 'File',
});


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface IFile extends mongoose.Document {
    _id           : string;
    type          : FileType;
    mimetype      : string;
    name          : string;
    size        : number;
    document_id   : string;
    parent_file_id: string;
    owner_id      : string;
    tags          : ITag[];
    preview       : boolean;
    updated_at    : string;
    created_at    : string;
}




/**
 * Processing model data
 */
FileSchema.plugin(uniqueValidator);

FileSchema.pre<IFile>("update", function(next) {
    this.updated_at = new Date().getTime().toString();
    next();
});

// Hide sensible information before exporting the object
FileSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.owner_id;
    delete obj.document_id;
    return obj;
}


export const File: mongoose.Model<IFile> = mongoose.model<IFile>('File', FileSchema);
export default IFile;