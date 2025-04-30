import { Document, Types } from 'mongoose';

export interface IPayout extends Document {
    user: Types.ObjectId;
    appointment: Types.ObjectId;
    transferdSource: {
        bankInfo: Types.ObjectId;
        bankName: string;
        accountNumber: string;
        countryCode: string;
    };
    currency: string;
    amount: number;
    status: string;
    failedReason: string;
    createdAt: Date;
    updatedAt: Date;
}
