import { Document, Types } from 'mongoose';

export interface IPurchaseSubscription extends Document {
  user: Types.ObjectId;
  subscription: Types.ObjectId;
  paymentStatus: string;
  paymentSource: {
    number: string;
    type: string;
    transactionId: string;
    isSaved: boolean;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
