import mongoose from 'mongoose';
import { IPaymentHistory } from './paymentHistory.interface';

const paymentHistorySchema = new mongoose.Schema<IPaymentHistory>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        purpose: { type: String, required: true },
        transactionId: { type: String, required: true },
        currency: { type: String, required: true },
        amount: { type: Number, required: true },
        paymentType: { type: String, enum: ['credit', 'debit'], required: true },
    },
    {
        timestamps: true,
    },
);

paymentHistorySchema.index({
    currency: 'text',
    paymentType: 'text',
    transactionId: 'text',
    purpose: 'text',
});

const PaymentHistory = mongoose.model<IPaymentHistory>('paymentHistory', paymentHistorySchema);
export default PaymentHistory;
