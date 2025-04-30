import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import walletServices from './wallet.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import paymentHistoryUtils from '../paymentHistoryModule/paymentHistory.utils';
import mongoose, { Types } from 'mongoose';
import notificationUtils from '../notificationModule/notification.utils';
import invoiceServices from '../invoiceModule/invoice.services';
import { paypalServiceInstancePromise } from '../../../libs/paypal/services/paypal.services';
import { CURRENCY_ENUM } from '../../../enums/currency';

// controller for retrive specific wallet by user id
const getSpecificWalletByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const wallet = await walletServices.getSpecificWalletByUserId(userId);
    if (!wallet) {
        throw new CustomError.NotFoundError('Wallet not found!');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Wallet retrieved successfully',
        data: wallet,
    });
});

// initiate wallet top-up
const initiateWalletTopUp = asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body;
    const userId = req.user!._id;

    const paymentService = await paypalServiceInstancePromise;
    console.log(amount);
    const order = await paymentService.createPaypalOrder(amount, CURRENCY_ENUM.USD);
console.log("..................",order)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Wallet top-up initiated successfully',
        data: {
            orderId: order.id,
            approvalUrl: order.links.find((link: { rel: string; href: string }) => link.rel === 'approve')?.href,
        },
    });
});

// controller for add balance to wallet
const addBalanceToWallet = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.body;
    const userId = req.user!._id;

    const paymentService = await paypalServiceInstancePromise;
    const captureData = await paymentService.capturePaypalOrder(orderId);

    const amount = captureData.purchase_units[0].payments.captures[0].amount.value;
    const currency = captureData.purchase_units[0].payments.captures[0].amount.currency_code;
    const transactionId = captureData.purchase_units[0].payments.captures[0].id;

    const wallet = await walletServices.createOrUpdateSpecificWallet(userId, {
        balance: { amount: parseFloat(amount), currency },
    });

    // Log the payment history
    await paymentHistoryUtils.createPaymentHistory({
        user: new mongoose.Types.ObjectId(userId),
        purpose: 'Balance added to wallet',
        amount: parseFloat(amount),
        transactionId,
        currency,
        paymentType: 'credit',
    });

    // Send notification
    await notificationUtils.createNotification({
        consumer: new mongoose.Types.ObjectId(userId),
        content: {
            title: 'Wallet recharged successfully',
            message: `You have added ${amount} ${currency} to your wallet.`,
            source: {
                type: 'wallet',
                id: wallet._id as unknown as Types.ObjectId,
            },
        },
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Wallet updated successfully',
        data: wallet,
    });
});

export default {
    getSpecificWalletByUserId,
    initiateWalletTopUp,
    addBalanceToWallet,
};
