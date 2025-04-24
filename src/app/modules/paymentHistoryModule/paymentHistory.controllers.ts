import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import paymentHistoryServices from './paymentHistory.services';
import { StatusCodes } from 'http-status-codes';
import paymentHistoryUtils from './paymentHistory.utils';
import mongoose from 'mongoose';

// controller for retrive all paymentHistories by user id
const getAllPaymentHistoryByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // await paymentHistoryUtils.createPaymentHistory({
  //   user: new mongoose.Types.ObjectId(userId),
  //   purpose: 'subscription buying',
  //   transactionId: '123456789',
  //   currency: 'USD',
  //   amount: 100,
  //   paymentType: 'debit',
  // });

  const paymentHistories = await paymentHistoryServices.getAllPaymentHistoryByUserId(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Payment Histories retrive successfull',
    data: paymentHistories,
  });
});

// controller for delete all paymentHistories
const deleteAllPaymentHistories = asyncHandler(async (req: Request, res: Response) => {
  const deletedPaymentHistories = await paymentHistoryServices.deleteAllPaymentHistory();
  if (!deletedPaymentHistories.deletedCount) {
    throw new Error('Failed to delete paymentHistories!');
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Payment Histories deleted successfull',
  });
});

// controller for get all payment histories
const getAllPaymentHistories = asyncHandler(async (req: Request, res: Response) => {
  const { searchQuery } = req.body;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const paymentHistories = await paymentHistoryServices.getAllPaymentHistories(searchQuery, skip, limit);

  const allPaymentHistories = await paymentHistoryServices.getAllDocumentsForPaymentHistory();

  const totalPaymentHistories = paymentHistories.length || 0;
  const totalPages = Math.ceil(totalPaymentHistories / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Payment Histories retrive successfull',
    meta: {
      totalData: totalPaymentHistories,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: paymentHistories,
  });
});

export default {
  getAllPaymentHistoryByUserId,
  deleteAllPaymentHistories,
  getAllPaymentHistories,
};
