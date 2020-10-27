import mongoose from 'mongoose';

/**
 * Building typescript & Mongoose data archs
 */
export const DeviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    browser: {
        type: String,
        required: true,
        trim: true
    },
    OS: {
        type: String,
        required: true,
        trim: true
    }
});


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface IDevice extends mongoose.Document {
    name: string;
    browser: string;
    OS: string;
}

// Hide sensible information before exporting the object
DeviceSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    delete obj._id;
    return obj;
}

export const Device: mongoose.Model<IDevice> = mongoose.model<IDevice>('Device', DeviceSchema);
export default IDevice;