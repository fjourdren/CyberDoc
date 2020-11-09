import mongoose from 'mongoose';

/**
 * Building typescript & Mongoose data archs
 */
export const UserSignSchema = new mongoose.Schema({
    user_id: {
        type    : String,
        required: true,
        trim    : true
    },
    user_name: {             // user first name + user last name
        type    : String,
        required: true,
        trim    : true
    },
    created_at: {
        type   : Date,
        default: new Date().getTime()
    }
}, { _id: false });



export interface IUserSign extends mongoose.Document {
    user_id   : string;
    user_name : string
    created_at: string;
}


export const UserSign: mongoose.Model<IUserSign> = mongoose.model<IUserSign>('UserSign', UserSignSchema);
export default IUserSign;