import { IPurchaseSubscription } from './purchaseSubscription.interface';
import PurchaseSubscription from './purchaseSubscription.model';

// service for create new purchaseSubscription
const createPurchaseSubscription = async (data: Partial<IPurchaseSubscription>) => {
    return await PurchaseSubscription.create(data);
};

// service for get purchased and active subscription by userId
const getPurchasedAndActiveSubscriptionByUserId = async (userId: string) => {
    return await PurchaseSubscription.findOne({ user: userId, status: 'active' });
};

// service for inactive subscription by userId and subscriptionId
const inactiveSubscriptionByUserIdAndSubscriptionId = async (userId: string, subscriptionId: string) => {
    return await PurchaseSubscription.updateMany(
        { user: userId, subscription: subscriptionId },
        { status: 'inactive' },
        {
            runValidators: true,
        },
    );
};

// service for get total earnings from all purchase subscriptions
const getTotalEarnings = async () => {
    const result = await PurchaseSubscription.aggregate([
        {
            $lookup: {
                from: 'subscriptions', // Matches the `Subscription` collection
                localField: 'subscription',
                foreignField: '_id',
                as: 'subscriptionData',
            },
        },
        { $unwind: '$subscriptionData' }, // Flatten the array
        {
            $group: {
                _id: '$subscriptionData.price.currency', // Group by currency
                totalEarnings: { $sum: '$subscriptionData.price.amount' },
            },
        },
    ]);

    if (!result.length) {
        return { totalEarnings: 0, currency: 'USD' };
    }

    return result.map((entry) => ({
        currency: entry._id,
        totalEarnings: entry.totalEarnings,
    }));
};

export default {
    createPurchaseSubscription,
    getPurchasedAndActiveSubscriptionByUserId,
    inactiveSubscriptionByUserIdAndSubscriptionId,
    getTotalEarnings,
};
