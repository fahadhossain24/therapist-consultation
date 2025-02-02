import { Request, Response } from 'express';
import subscriptionService from './subscription.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import asyncHandler from '../../../shared/asyncHandler';

// Controller for adding a new subscription
const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = req.body;
  const newSubscription = await subscriptionService.createSubscription(subscription);
  if (!newSubscription) {
    throw new CustomError.BadRequestError('Failed to create new subscription!');
  }
  sendResponse(res, {
    statusCode: 201,
    status: 'success',
    message: 'Subscription created successfully',
    data: newSubscription,
  });
});

// Controller for getting all subscriptions
const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const subscriptions = await subscriptionService.getAllSubscriptions(query as string, skip, limit);

  const totalSubscriptions = subscriptions.length || 0;
  const totalPages = Math.ceil(totalSubscriptions / limit);

  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Subscriptions retrieved successfully',
    meta: {
      totalData: totalSubscriptions,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: subscriptions,
  });
});

// Controller for updating a specific subscription
const updateSpecificSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const updatedSubscription = await subscriptionService.updateSpecificSubscription(id, data);

  if (!updatedSubscription?.isModified) {
    throw new CustomError.BadRequestError('Failed to update Subscription!');
  }

  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Subscription updated successfully',
  });
});

// Controller for deleting a specific subscription
const deleteSpecificSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedSubscription = await subscriptionService.deleteSpecificSubscription(id);

  if (!deletedSubscription?.$isDeleted) {
    throw new CustomError.BadRequestError('Failed to delete Subscription!');
  }

  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Subscription deleted successfully',
  });
});

// controller for get specific subscription by id
const getSpecificSubscriptionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subscription = await subscriptionService.getSpecificSubscription(id);
  if (!subscription) {
    throw new CustomError.NotFoundError('Subscription not found!');
  }
  sendResponse(res, {
    statusCode: 200,
    status: 'success',
    message: 'Subscription retrieved successfully',
    data: subscription,
  });
});

export default {
  createSubscription,
  getSubscriptions,
  updateSpecificSubscription,
  deleteSpecificSubscription,
  getSpecificSubscriptionById
};
