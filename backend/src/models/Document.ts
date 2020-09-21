import mongoose from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import validator from 'validator';
import Guid from 'guid';


/**
 * Building typescript & Mongoose data archs
 */
const DocumentSchema = new mongoose.Schema({
    _id: {
		type: String,
		default: () => Guid.raw()
	},
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type     : String,
        required : true,
        unique   : true,
        uniqueCaseInsensitive: true,
        trim     : true,
        minlength: 5,
        validate : {
            validator: (value: string) => validator.isEmail(value),
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
		type     : String,
		required : true
	},
    updated_at: {
        type: Date,
        default: new Date().getTime()
    },
    created_at: {
        type: Date,
        default: new Date().getTime()
    }
},
{
  collection: 'Document',
})


// DO NOT export this, Type script validation (= Mongoose raw model)
interface IDocumentSchema extends mongoose.Document {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    updated_at: string;
    created_at: string;
}


// Export this (= Mongoose after filtering and hiding sensitive data)
export interface IDocument extends IDocumentSchema {
    
}




/**
 * Processing model data
 */
DocumentSchema.plugin(uniqueValidator);

DocumentSchema.pre<IDocument>("save", function(next: any) {
    this.updated_at = new Date().getTime().toString();
    next();
});

DocumentSchema.pre<IDocument>("update", function(next) {
    this.updated_at = new Date().getTime().toString();
    next();
});


export const Document = mongoose.model<IDocument>('Document', DocumentSchema);