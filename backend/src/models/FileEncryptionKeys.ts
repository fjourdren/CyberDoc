import mongoose from 'mongoose';

/**
 * Building typescript & Mongoose data archs
 */
// Model which contains users' files encryption keys (themselves encrypted by user's public key)
export const FileEncryptionKeysSchema = new mongoose.Schema({
    file_id: {
        type: String,
        required: true,
        uniqueCaseInsensitive: true
    },
    encryption_file_key: {
        type: String,
        required: true,
        trim: true
    }
}, { _id : false });


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface IFileEncryptionKeys extends mongoose.Document {
    file_id: string;
    encryption_file_key: string;
}


/**
 * Processing model data
 */
// Hide sensible information before exporting the object
FileEncryptionKeysSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
}


export const FileEncryptionKeys: mongoose.Model<IFileEncryptionKeys> = mongoose.model<IFileEncryptionKeys>('FileEncryptionKeys', FileEncryptionKeysSchema);
export default IFileEncryptionKeys;