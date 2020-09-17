import mongoose from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const Guid = require('guid')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET || 'devmode'


/**
 * Building typescript & Mongoose data archs
 */
const UserSchema = new mongoose.Schema({
    _id: {
		type: String,
		default: () => Guid.raw()
	},
    name: {
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
		required : true,
		minlength: 6
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
    name: string;
    email: string;
    password: string;
    updated_at: string;
    created_at: string;
}


// Export this (= Mongoose after filtering and hiding sensitive data)
interface IUser extends IUserSchema {
    
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


UserSchema.statics.findByCredentials = async function(email: string, password: string) {
    const user = this
    return new Promise(async (resolve, reject) => {
        try {
            user.findOne({ email }, (err: any, doc: any) => {
                if(err || !doc) { 
                    return reject({ status: 401, message: 'Invalid credentials'})
                }

                bcrypt.compare(password, doc.password, (err: any, didMatch: boolean) => {
                    if(err) return reject(err)
                    if(didMatch) {
                        resolve(doc)
                    } else {
                        reject({ message: 'Not authorized'})
                    }
                })
            })
        } catch (e) {
            reject(e)
        }
    })

}

UserSchema.statics.findByTokenJWT = function(tokenJWT: string) {
    return new Promise((resolve, reject) => {
        let decodedIdAndToken = jwt.verify(tokenJWT, secret)
        this.findById(decodedIdAndToken._id, (err: any, user: any) => {
            if (err) {
                return reject(err)
            }
            
            return resolve(user)
        })
    })
}




export default mongoose.model<IUser>('User', UserSchema);