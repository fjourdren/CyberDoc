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
    hexColor: {
        type: String,
        required: true,
        uniqueCaseInsensitive: true,
        trim: true,
        validate: {
            validator: function(value: string) {
                return (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value));
            },
            message: () => `Color needs to be a hexadecimal value`
        }
    }
});


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface ITag extends mongoose.Document {
    _id: string;
    name: string;
    hexColor: string;
}

export const Tag: mongoose.Model<ITag> = mongoose.model<ITag>('Tag', TagSchema);
export default ITag;