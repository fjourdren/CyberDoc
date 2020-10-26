import mongoose from 'mongoose';

/**
 * Building typescript & Mongoose data archs
 */
export const IDeviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
});


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface IDevice extends mongoose.Document {
    name: string;
}

export const Device: mongoose.Model<IDevice> = mongoose.model<IDevice>('Device', IDeviceSchema);
export default IDevice;