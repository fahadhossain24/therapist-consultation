import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import { Request, Response } from 'express';
import invoiceServices from './invoice.services';
import invoiceUtils from './invoice.utils';
import mongoose from 'mongoose';

// controller for retrive all invoices by user id
const getAllInvoicesByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  // create a invoice
//   await invoiceUtils.createInvoice({
//     user: {
//         type: 'therapist',
//         id: new mongoose.Types.ObjectId(userId),
//     },
//     appointment: new mongoose.Types.ObjectId(userId)
//   })

  const skip = (page - 1) * limit;
  const invoices = await invoiceServices.getAllInvoicesByUserId(userId, query as string, skip, limit);

  const totalInvoices = invoices.length || 0;
  const totalPages = Math.ceil(totalInvoices / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Invoices retrive successfull',
    meta: {
      totalData: totalInvoices,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: invoices,
  });
});

// controller for get specific invoice by id
const getSpecificInvoiceById = asyncHandler(async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const invoice = await invoiceServices.getInvoiceById(invoiceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Invoice retrieved successfully',
    data: invoice,
  });
});

export default {
  getAllInvoicesByUserId,
  getSpecificInvoiceById,
};
