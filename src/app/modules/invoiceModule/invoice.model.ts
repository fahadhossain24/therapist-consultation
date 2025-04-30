import mongoose from 'mongoose';
import { IInvoice } from './invoice.interface';

const invoiceSchema = new mongoose.Schema<IInvoice>(
    {
        user: {
            type: {
                type: String,
                enum: ['patient', 'therapist'],
                required: true,
            },
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        },
        appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: true },
        invoiceId: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

invoiceSchema.index({
    invoiceId: 'text',
});

const Invoice = mongoose.model<IInvoice>('invoice', invoiceSchema);
export default Invoice;
