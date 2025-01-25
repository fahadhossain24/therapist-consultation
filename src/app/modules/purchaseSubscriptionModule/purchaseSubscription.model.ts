import mongoose from 'mongoose';

const purchaseSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'subscription', required: true },
    paymentStatus: { type: String, enum: ['paid'], required: true },
    paymentSource: {
      number: { type: String, required: true },
      type: {
        type: String,
        enum: {
          values: ['card', 'bank', 'mobile-wallet'],
          message: '{VALUE} is not supported, use card/bank/mobile-wallet',
        },
        required: true,
      },
      transactionId: { type: String, required: true },
      isSaved: { type: Boolean, required: false },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
  },
);

const PurchaseSubscription = mongoose.model('purchaseSubscription', purchaseSubscriptionSchema);
export default PurchaseSubscription;
