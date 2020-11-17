import mongoose from 'mongoose';

export const EtherpadDataSchema = new mongoose.Schema({
    key: {
        type: String,
        require: true
    },
    val: { /*json value*/
        type: String,
        require: true
    }
},
    {
        collection: 'EtherpadData',
    })

export interface IEtherpadData extends mongoose.Document {
    key: string;
    val: string; /*json value*/
}

export const EtherpadData: mongoose.Model<IEtherpadData> = mongoose.model<IEtherpadData>('EtherpadData', EtherpadDataSchema);
export default IEtherpadData;