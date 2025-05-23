// bankInfo.model.ts
import mongoose, { Schema } from 'mongoose';
import { IBankInfo } from './bankInfo.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const bankInfoSchema = new Schema<IBankInfo>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'user' },
        paypalEmail: { type: String },
        // accountHolderName: { type: String },
        // bankName: { type: String },
        // branchName: { type: String },
        // accountNumber: { type: String },
        // routingNumber: { type: String },
        // swiftCode: { type: String },
        // iban: { type: String },
        // countryCode: { type: String },
        // accountType: { type: String },
        // currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
        isActive: { type: Boolean, default: false },
        // errorLogs: [
        //     {
        //         errorCode: { type: String },
        //         errorMessage: { type: String },
        //         timestamp: { type: Date, default: Date.now },
        //     },
        // ],
    },
    {
        timestamps: true,
    },
);

const BankInfo = mongoose.model<IBankInfo>('bankInfo', bankInfoSchema);
export default BankInfo;
