import mongoose from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import Guid from 'guid';


/**
 * Users role enum
 */
export enum Role {
    OWNER         = 'owner',
    COLLABORATER  = 'collaborater'
}


/**
 * Building typescript & Mongoose data archs
 */
export const UserSchema = new mongoose.Schema({
    _id: {},
    directory_id: {
		type    : String,
		required: true,
	},
    firstname: {
        type                 : String,
        required             : true,
        uniqueCaseInsensitive: true,
        trim                 : true
    },
    lastname: {
        type                 : String,
        required             : true,
        uniqueCaseInsensitive: true,
        trim                 : true
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
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.COLLABORATER
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
    collection: 'User',
})


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface IUser extends mongoose.Document {
    _id: string;
    directory_id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: Role;
    updated_at: string;
    created_at: string;
}




/**
 * Processing model data
 */
UserSchema.plugin(uniqueValidator);

UserSchema.pre<IUser>("save", function(next: mongoose.HookNextFunction): void {
    this.updated_at = new Date().getTime().toString();

    if(this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }

    next();
});

UserSchema.pre<IUser>("update", function(next: mongoose.HookNextFunction): void {
    this.updated_at = new Date().getTime().toString();
    next();
});

// Hide sensible information before exporting the object
UserSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.password;
    return obj;
}


export const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default IUser;