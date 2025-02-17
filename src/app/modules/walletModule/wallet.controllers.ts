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

// controller for add balance to wallet
const addBalanceToWallet = asyncHandler(async (req: Request, res: Response) => {
  const { userId, amount, currency, transactionId } = req.body;
  const wallet = await walletServices.createOrUpdateSpecificWallet(userId, { balance: { amount, currency } });

  // make a payment history
  paymentHistoryUtils.createPaymentHistory({
    user: new mongoose.Types.ObjectId(userId),
    purpose: 'Balance added to wallet',
    amount,
    transactionId,
    currency,
    paymentType: 'credit',
  });

  // make notification for adding balance to wallet
  await notificationUtils.createNotification({
    consumer: new mongoose.Types.ObjectId(userId),
    content: {
      title: 'Wallet recharged successfull',
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
  addBalanceToWallet,
};
