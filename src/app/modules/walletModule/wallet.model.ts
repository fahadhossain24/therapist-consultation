import mongoose from 'mongoose';
import { IWallet } from './wallet.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const walletSchema = new mongoose.Schema<IWallet>(
    {
        user: {
            type: {
                type: String,
                enum: ['patient', 'therapist'],
                required: true,
            },
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        },
        balance: {
            amount: { type: Number, default: 0 },
            currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
        },
        holdBalance: {
            amount: { type: Number, default: 0, required: true },
            currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
        },
    },
    {
        timestamps: true,
    },
);

const Wallet = mongoose.model<IWallet>('wallet', walletSchema);
export default Wallet;
