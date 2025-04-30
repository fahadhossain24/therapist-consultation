import { IPaymentHistory } from './paymentHistory.interface';
import PaymentHistory from './paymentHistory.model';

// service for create new payout
const createPaymentHistory = async (data: Partial<IPaymentHistory>) => {
    return await PaymentHistory.create(data);
};

// service for get all payouts by user id (therapist)
const getAllPaymentHistoryByUserId = async (userId: string) => {
    return await PaymentHistory.find({ user: userId }).populate({
        path: 'user',
        select: 'firstName lastName',
    });
};

//service for delete all payouts
const deleteAllPaymentHistory = async () => {
    return await PaymentHistory.deleteMany();
};

// service for get all payment histories with search and pagination
const getAllPaymentHistories = async (searchQuery: string, skip: number, limit: number) => {
    const query: any = {};
    if (searchQuery) {
        query.$text = { $search: searchQuery };
    }
    return await PaymentHistory.find(query)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'user',
            select: 'firstName lastName profile role',
            populate: {
                path: 'profile',
                select: 'speciality image',
            },
        });
};

// service for get all documents for payment history
const getAllDocumentsForPaymentHistory = async () => {
    return await PaymentHistory.countDocuments();
};

// service for get specific payment history

export default {
    createPaymentHistory,
    getAllPaymentHistoryByUserId,
    deleteAllPaymentHistory,
    getAllPaymentHistories,
    getAllDocumentsForPaymentHistory,
};
