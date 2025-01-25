import { Document, Types } from 'mongoose';

export interface IPaymentHistory extends Document {
    user: Types.ObjectId;
    purpose: string;
    transactionId: string;
    currency: string;
    amount: number;
    paymentType: string;
    createdAt: Date;
    updatedAt: Date;
}