import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import walletServices from './wallet.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

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

export default {
    getSpecificWalletByUserId
}
