import mongoose from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import Guid from 'guid';

import ITag, { Tag } from './Tag';
import IDevice, { Device } from './Device';
import IUserEncryptionKeys, { UserEncryptionKeys } from './UserEncryptionKeys';
import IFileEncryptionKeys, { FileEncryptionKeys } from './FileEncryptionKeys';


/**
 * Users role enum
 */
export enum Role {
    OWNER = 'owner',
    COLLABORATOR = 'collaborator'
}


/**
 * Building typescript & Mongoose data archs
 */
export const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        uniqueCaseInsensitive: true,
        default: () => Guid.raw()
    },
    directory_id: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
        uniqueCaseInsensitive: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        uniqueCaseInsensitive: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        trim: true,
        minlength: 5,
        validate: {
            validator: (value: string) => validator.isEmail(value),
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value: string) {
                if (!value) return false;
                if (!value.match(/[A-Z]/g)) return false;
                if (!value.match(/[a-z]/g)) return false;
                if (!value.match(/[0-9]/g)) return false;
                if (!value.replace(/[0-9a-zA-Z ]/g, "").length) return false;
                return true;
            },
        },
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    secret: {
        type: String,
        trim: true,
        validate: {
            validator: (value: string) => value.length == 32,
            message: '{VALUE} is not a valid secret'
        }
    },
    twoFactorApp: {
        type: Boolean,
        required: true
    },
    twoFactorSms: {
        type: Boolean,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.COLLABORATOR
    },
    tags: {
        type: [Tag.schema]
    },
    devices: {
        type: [Device.schema],
        default: []
    },
    updated_at: {
        type: Date,
        default: new Date().getTime()
    },
    created_at: {
        type: Date,
        default: new Date().getTime()
    },
    // file encryption data
    userKeys: {
        type: [UserEncryptionKeys.schema]
    },
    filesKeys: {
        type: [FileEncryptionKeys.schema]
    },
},
    {
        collection: 'User',
    });


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface IUser extends mongoose.Document {
    _id: string;
    directory_id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phoneNumber: string;
    secret: string;
    twoFactorApp: boolean;
    twoFactorSms: boolean;
    role: Role;
    tags: ITag[];
    devices: IDevice[];
    userKeys: IUserEncryptionKeys,
    filesKeys: IFileEncryptionKeys[],
    updated_at: string;
    created_at: string;
}


/**
 * Processing model data
 */
UserSchema.plugin(uniqueValidator);

UserSchema.pre<IUser>("save", function (next: mongoose.HookNextFunction): void {
    this.updated_at = new Date().getTime().toString();
    this.email = this.email.toLowerCase();

    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }

    next();
});

UserSchema.pre<IUser>("update", function (next: mongoose.HookNextFunction): void {
    this.updated_at = new Date().getTime().toString();
    if (this.email) this.email = this.email.toLowerCase();
    next();
});

// Hide sensible information before exporting the object
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.password;

    // delete too long informations (for performances and for security with encryption keys)
    delete obj.tags;
    delete obj.userKeys;
    delete obj.filesKeys;
    return obj;
}


export const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default IUser;