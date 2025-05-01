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

    const order = await paymentService.createPaypalOrder(amount, CURRENCY_ENUM.USD, userId);

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
const returnWalletTopUp = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.query.token as string;

    const paymentService = await paypalServiceInstancePromise;
    const captureData = await paymentService.capturePaypalOrder(orderId);

    const transactionStatus = captureData.purchase_units[0].payments.captures[0].status;

    if (transactionStatus !== 'COMPLETED') {
        return sendResponse(res, {
            statusCode: StatusCodes.BAD_REQUEST,
            status: 'fail',
            message: 'Payment not completed. Please try again.',
        });
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Payment Approved.',
    });
});

// controller for cancel wallet top-up
const cancelWalletTopUp = asyncHandler(async (req: Request, res: Response) => {
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Wallet top up cancel',
    });
});

export default {
    getSpecificWalletByUserId,
    initiateWalletTopUp,
    returnWalletTopUp,
    cancelWalletTopUp,
};
