import { IPurchaseSubscription } from "./purchaseSubscription.interface";
import PurchaseSubscription from "./purchaseSubscription.model";

// service for create new purchaseSubscription
const createPurchaseSubscription = async (data: Partial<IPurchaseSubscription>) => {
    return await PurchaseSubscription.create(data);
};

// service for get purchased and active subscription by userId
const getPurchasedAndActiveSubscriptionByUserId = async (userId: string) => {
    return await PurchaseSubscription.findOne({ user: userId, status: 'active' });
}

// service for inactive subscription by userId and subscriptionId
const inactiveSubscriptionByUserIdAndSubscriptionId = async (userId: string, subscriptionId: string) => {
    return await PurchaseSubscription.updateMany({ user: userId, subscription: subscriptionId }, { status: 'inactive' }, {
        runValidators: true,
    });
}

export default {
    createPurchaseSubscription,
    getPurchasedAndActiveSubscriptionByUserId,
    inactiveSubscriptionByUserIdAndSubscriptionId
}