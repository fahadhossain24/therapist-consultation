import mongoose from 'mongoose';
import { IMessageCost } from './messageCost.interface';

const messageCostSchema = new mongoose.Schema<IMessageCost>(
  {
    costPerMessage: {
      currency: { type: String, enum: ['USD'], default: 'USD' },
      amount: { type: Number, required: true },
    },
    maxWords: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

messageCostSchema.index({ 'costPerMessage.currency': 'text' }); // Add text index for search

const MessageCost = mongoose.model<IMessageCost>('messageCost', messageCostSchema);
export default MessageCost;
