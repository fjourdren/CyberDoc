import mongoose from 'mongoose';

/**
 * Building typescript & Mongoose data archs
 */
export const TwoFactorRecoveryCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        trim: true
    },
    isValid: {
        type: Boolean
    }
});


// DO NOT export this, Type script validation (= Mongoose raw model)
export interface ITwoFactorRecoveryCode extends mongoose.Document {
    code: string,
    isValid: boolean
}

// Hide sensible information before exporting the object
TwoFactorRecoveryCodeSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    delete obj._id;
    return obj;
}

export const TwoFactorRecoveryCode: mongoose.Model<ITwoFactorRecoveryCode> = mongoose.model<ITwoFactorRecoveryCode>('TwoFactorRecoveryCode', TwoFactorRecoveryCodeSchema);
export default ITwoFactorRecoveryCode;
