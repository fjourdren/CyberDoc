import mongoose from 'mongoose';
import validator from 'validator';

/**
 * Building typescript & Mongoose data archs
 */
export const SharedWithPendingSchema = new mongoose.Schema({
    email: {
        type: String,
        sparse: true,
        required: true,
        trim: true,
        minlength: 5,
        validate: {
            validator: (value: string) => validator.isEmail(value),
            message: '{VALUE} is not a valid email'
        }
    },
    file_aes_key: {
        type: String,
        require: true
    }
}, { _id: false });



export interface ISharedWithPending extends mongoose.Document {
    email: string;
    file_aes_key: string;
}


export const SharedWithPending: mongoose.Model<ISharedWithPending> = mongoose.model<ISharedWithPending>('SharedWithPending', SharedWithPendingSchema);
export default ISharedWithPending;