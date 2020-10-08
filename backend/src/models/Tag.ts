import mongoose from 'mongoose';

import Guid from 'guid';

/**
 * Building typescript & Mongoose data archs
 */
export const TagSchema = new mongoose.Schema({
    _id: {
        type: String,
        sparse: true,
        uniqueCaseInsensitive: true,
        default: () => Guid.raw()
    },
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
        uniqueCaseInsensitive: true,
        trim: true
    },
    updated_at: {
        type: Date,
        default: new Date().getTime()
    },
    created_at: {
        type: Date,
        default: new Date().getTime()
    }
});


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface ITag extends mongoose.Document {
    _id: string;
    name: string;
    color: string;
    updated_at: string;
    created_at: string;
}




/**
 * Processing model data
 */
TagSchema.pre<ITag>("update", function (next: mongoose.HookNextFunction): void {
    this.updated_at = new Date().getTime().toString();
    next();
});

export const Tag: mongoose.Model<ITag> = mongoose.model<ITag>('Tag', TagSchema);
export default ITag;