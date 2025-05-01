import { Types } from 'mongoose';
import paymentHistoryUtils from '../paymentHistoryModule/paymentHistory.utils';
import { IWallet } from './wallet.interface';
import Wallet from './wallet.model';
import notificationUtils from '../notificationModule/notification.utils';
import CustomError from '../../errors';

// service for create or update new wallet by user id
const createOrUpdateSpecificWallet = async (userId: string, data: Partial<IWallet>) => {
    return await Wallet.findOneAndUpdate(
        { 'user.id': userId },
        data,
        { runValidators: true, upsert: true, new: true }, // Add upsert: true
    );
};

// service for get specific wallet by user
const getSpecificWalletByUserId = async (userId: string) => {
    return await Wallet.findOne({ 'user.id': userId });
};

// service for delete specific wallet
const deleteSpecificWallet = async (userId: string) => {
    return await Wallet.deleteOne({ 'user.id': userId });
};

// service for update wallet by id
const updateWalletById = async (userId: string, data: Partial<IWallet>) => {
    return await Wallet.findOneAndUpdate({ 'user.id': userId }, data, { runValidators: true });
};

// service for update wallet after payment capture
const handleWalletTopUpAfterPaymentCapture = async (event: any) => {
    const capture = event.resource;
    const amount = parseFloat(capture.amount.value);
    const currency = capture.amount.currency_code;
    const transactionId = capture.id;
    const userId = capture.custom_id;

    if (!userId) return;

    const wallet = await getSpecificWalletByUserId(userId);

    if(!wallet){
        throw new CustomError.BadRequestError('Wallet not found!');
    }

    wallet.balance.amount += amount;
    wallet.balance.currency = currency;
    await wallet.save();
    

    await paymentHistoryUtils.createPaymentHistory({
        user: new Types.ObjectId(userId),
        purpose: 'Balance added to wallet',
        amount,
        transactionId,
        currency,
        paymentType: 'credit',
    });

    await notificationUtils.createNotification({
        consumer: new Types.ObjectId(userId),
        content: {
            title: 'Wallet recharged successfully',
            message: `You have added ${amount} ${currency} to your wallet.`,
            source: {
                type: 'wallet',
                id: wallet._id as Types.ObjectId,
            },
        },
    });
};


export default {
    createOrUpdateSpecificWallet,
    getSpecificWalletByUserId,
    deleteSpecificWallet,
    updateWalletById,
    handleWalletTopUpAfterPaymentCapture,
};
