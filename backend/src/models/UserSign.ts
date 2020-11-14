import mongoose from 'mongoose';
import validator from 'validator';

/**
 * Building typescript & Mongoose data archs
 */
export const UserSignSchema = new mongoose.Schema({
    user_email: {
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
    created_at: {
        type   : Date,
        require: true
    },
    diggest: {
        type: String,
        require: true
    }
}, { _id: false });



export interface IUserSign extends mongoose.Document {
    user_email: string;
    created_at: Date;
    diggest   : string;
}


export const UserSign: mongoose.Model<IUserSign> = mongoose.model<IUserSign>('UserSign', UserSignSchema);
export default IUserSign;