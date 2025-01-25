import mongoose from 'mongoose';
import { IPayout } from './payout.interface';

const payoutSchema = new mongoose.Schema<IPayout>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: true },
    transferdSource: {
      bankInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'bankInfo', required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      countryCode: { type: String, required: true },
    },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['processing', 'completed', 'failed'], required: true },
    failedReason: { type: String },
  },
  {
    timestamps: true,
  },
);

const Payout = mongoose.model<IPayout>('payout', payoutSchema);
export default Payout;
