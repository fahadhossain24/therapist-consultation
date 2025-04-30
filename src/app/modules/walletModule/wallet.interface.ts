import { Document, Types } from 'mongoose';

export interface IWallet extends Document {
    user: {
        type: string;
        id: Types.ObjectId;
    };
    balance: {
        amount: number;
        currency: string;
    };
    holdBalance: {
        amount: number;
        currency: string;
    };
}
