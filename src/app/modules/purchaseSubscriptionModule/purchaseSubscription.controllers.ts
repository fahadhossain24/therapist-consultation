import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import purchaseSubscriptionService from './purchaseSubscription.services';
import sendResponse from '../../../shared/sendResponse';
import CustomError from '../../errors';
import { StatusCodes } from 'http-status-codes';

// Controller for creating a new purchase subscription
const createPurchaseSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscriptionData = req.body;

  // Check if there is an active subscription for the user
  const existingActiveSubscription = await purchaseSubscriptionService.getPurchasedAndActiveSubscriptionByUserId(subscriptionData.user);
  if (existingActiveSubscription) {
    // If there is an active subscription, deactivate it
    await purchaseSubscriptionService.inactiveSubscriptionByUserIdAndSubscriptionId(
      subscriptionData.user,
      existingActiveSubscription.subscription as unknown as string,
    );
  }

  // Create the new subscription
  const newSubscription = await purchaseSubscriptionService.createPurchaseSubscription(subscriptionData);
  if(!newSubscription){
    throw new CustomError.BadRequestError('Failed to purchase subscription!');
  }
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Subscription successfully purchased',
  });
});

// Controller for getting purchase subscriptions
const getPurchasedAndActiveSubscriptionByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const subscription = await purchaseSubscriptionService.getPurchasedAndActiveSubscriptionByUserId(userId);

  if (!subscription) {
    throw new CustomError.NotFoundError('No purchased subscription found!!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Purchase Subscription retrieved successfully',
    data: subscription,
  });
});

// Controller for getting a specific purchase subscription
const inactiveSubscriptionByUserIdAndSubscriptionId = asyncHandler(async (req: Request, res: Response) => {
  const { userId, subscriptionId } = req.params;

  const subscription = await purchaseSubscriptionService.inactiveSubscriptionByUserIdAndSubscriptionId(userId, subscriptionId);

  if (!subscription?.modifiedCount) {
    throw new CustomError.NotFoundError('Failed to inactive the purchased subscription!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Purchase Subscription inactivated successfully',
  });
});

export default {
  createPurchaseSubscription,
  getPurchasedAndActiveSubscriptionByUserId,
  inactiveSubscriptionByUserIdAndSubscriptionId,
};
