import mongoose from 'mongoose';
import { IMessageCost } from './messageCost.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const messageCostSchema = new mongoose.Schema<IMessageCost>(
  {
    costPerMessage: {
      currency: { type: String, enum: CURRENCY_ENUM, default: CURRENCY_ENUM.USD },
      amount: { type: Number, required: true },
    },
    maxCharacters: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

messageCostSchema.index({ 'costPerMessage.currency': 'text' }); // Add text index for search

const MessageCost = mongoose.model<IMessageCost>('messageCost', messageCostSchema);
export default MessageCost;
