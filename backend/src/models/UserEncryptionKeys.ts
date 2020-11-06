import mongoose from 'mongoose';
import Guid from 'guid';

/**
 * Building typescript & Mongoose data archs
 */
// Model which contains users' asymetrical encryption keys (private key is encrypted by user's hash => email + password)
export const UserEncryptionKeysSchema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        uniqueCaseInsensitive: true,
        default: () => Guid.raw()
    },
    public_key: {
        type: String,
        required: true,
        trim: true
    },
    encrypted_private_key: {
        type: String,
        required: true,
        trim: true
    }
});


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface IUserEncryptionKeys extends mongoose.Document {
    _id: string;
    public_key: string;
    encrypted_private_key: string;
}



/**
 * Processing model data
 */
// Hide sensible information before exporting the object
UserEncryptionKeysSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
}


export const UserEncryptionKeys: mongoose.Model<IUserEncryptionKeys> = mongoose.model<IUserEncryptionKeys>('UserEncryptionKeys', UserEncryptionKeysSchema);
export default IUserEncryptionKeys;