import Subscription from './subscription.model';
import { ISubscription } from './subscription.interface';

class SubscriptionService {
    public async createSubscription(subscription: Partial<ISubscription>) {
        const newSubscription = new Subscription(subscription);
        return await newSubscription.save();
    }

    public async getAllSubscriptions(searchQuery: string, skip: number, limit: number): Promise<Partial<ISubscription[]>> {
        const query: any = {};
        if (searchQuery) {
            query.$text = { $search: searchQuery };
        }
        return await Subscription.find(query).skip(skip).limit(limit);
    }

    public async getSpecificSubscription(id: string) {
        const subscription = await Subscription.findById(id);
        return subscription;
    }

    public async updateSpecificSubscription(id: string, data: Partial<ISubscription>) {
        const updatedSubscription = await Subscription.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        return updatedSubscription;
    }

    public async deleteSpecificSubscription(id: string) {
        const deletedSubscription = await Subscription.findByIdAndDelete(id);
        return deletedSubscription;
    }
}

export default new SubscriptionService();
