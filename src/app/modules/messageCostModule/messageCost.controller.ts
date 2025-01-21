import { Request, Response } from 'express';
import messageCostService from './messageCost.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import asyncHandler from '../../../shared/asyncHandler';
import MessageCost from './messageCost.model';

// Controller for adding a new message cost
const createMessageCost = asyncHandler(async (req: Request, res: Response) => {
  const messageCost = req.body;
  const existingMessageCost = await MessageCost.findOne();
  if (existingMessageCost) {
    throw new CustomError.BadRequestError('Already you have a message cost!');
  }
  const newMessageCost = await messageCostService.createMessageCost(messageCost);
  if (!newMessageCost) {
    throw new CustomError.BadRequestError('Failed to create new message cost!');
  }
  sendResponse(res, {
    statusCode: 201,
    status: 'success',
    message: 'Message cost created successfully',
    data: newMessageCost,
  });
});

// Controller for getting all message costs
const getMessageCosts = asyncHandler(async (req: Request, res: Response) => {

  const messageCost = await messageCostService.getMessageCosts();

  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Message costs retrieved successfully',
    data: messageCost,
  });
});

// Controller for updating a specific message cost
const updateSpecificMessageCost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updatedMessageCost = await messageCostService.updateSpecificMessageCost(id, data);

  if (!updatedMessageCost?.isModified) {
    throw new CustomError.BadRequestError('Failed to update Message Cost!');
  }

  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Message Cost updated successfully',
  });
});

// Controller for deleting a specific message cost
const deleteSpecificMessageCost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedMessageCost = await messageCostService.deleteSpecificMessageCost(id);

  if (!deletedMessageCost?.$isDeleted) {
    throw new CustomError.BadRequestError('Failed to delete Message Cost!');
  }

  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Message Cost deleted successfully',
  });
});

export default {
  createMessageCost,
  getMessageCosts,
  updateSpecificMessageCost,
  deleteSpecificMessageCost,
};
