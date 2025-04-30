import mongoose from 'mongoose';
import { ISubscription } from './subscription.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const subscriptionSchema = new mongoose.Schema<ISubscription>(
    {
        name: { type: String, required: true },
        price: {
            currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
            amount: { type: Number, required: true },
        },
        validity: {
            type: {
                type: String,
                enum: ['months', 'years'],
                required: true,
            },
            value: { type: Number, required: true },
        },
        features: { type: [String], required: true },
    },
    {
        timestamps: true,
    },
);

subscriptionSchema.index({ name: 'text', features: 'text' });

const Subscription = mongoose.model<ISubscription>('subscription', subscriptionSchema);
export default Subscription;
