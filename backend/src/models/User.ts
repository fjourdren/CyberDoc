import mongoose from 'mongoose';

import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import Guid from 'guid';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'devmode'


/**
 * Building typescript & Mongoose data archs
 */
const UserSchema = new mongoose.Schema({
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
  collection: 'User',
})


// DO NOT export this, Type script validation (= Mongoose raw model)
interface IUserSchema extends mongoose.Document {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    updated_at: string;
    created_at: string;
}


// Export this (= Mongoose after filtering and hiding sensitive data)
export interface IUser extends IUserSchema {
    
}




/**
 * Processing model data
 */
UserSchema.plugin(uniqueValidator);

UserSchema.pre<IUser>("save", function(next: any) {
    this.updated_at = new Date().getTime().toString();

    if(this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }

    next();
});

UserSchema.pre<IUser>("update", function(next) {
    this.updated_at = new Date().getTime().toString();
    next();
});



/*UserSchema.statics.findByTokenJWT = function(tokenJWT: string) {
    return new Promise((resolve, reject) => {
        let decodedIdAndToken = jwt.verify(tokenJWT, secret)
        this.findById(decodedIdAndToken._id, (err: any, user: any) => {
            if (err) {
                return reject(err)
            }
            
            return resolve(user)
        })
    })
}*/




export const User = mongoose.model<IUser>('User', UserSchema);