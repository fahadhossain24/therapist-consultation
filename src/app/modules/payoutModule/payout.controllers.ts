import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import payoutServices from './payout.services';
import { StatusCodes } from 'http-status-codes';

// controller for retrive all payouts by user id
const getAllPayoutsByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const payouts = await payoutServices.getAllPayoutsByTherapist(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Payouts retrive successfull',
    data: payouts,
  });
});

// controller for retrive all payouts by bank info id
const getAllPayoutsByBankInfoId = asyncHandler(async (req: Request, res: Response) => {
  const { bankInfoId } = req.params;

  const payouts = await payoutServices.getAllPayoutsByBankInfo(bankInfoId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Payouts retrive successfull',
    data: payouts,
  });
});

// controller for delete all payouts
const deleteAllPayouts = asyncHandler(async (req: Request, res: Response) => {
  const deletedPayouts = await payoutServices.deleteAllPayouts();
  if (!deletedPayouts.deletedCount) {
    throw new Error('Failed to delete payouts!');
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Payouts deleted successfull',
  });
});

export default {
  getAllPayoutsByUserId,
  getAllPayoutsByBankInfoId,
  deleteAllPayouts,
};
