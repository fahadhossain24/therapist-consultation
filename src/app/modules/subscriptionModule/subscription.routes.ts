import { Router } from 'express';
import subscriptionController from './subscription.controller';
import requestValidator from '../../middlewares/requestValidator';
import SubscriptionValidationZodSchema from './subscription.validation';
import authentication from '../../middlewares/authorization';

const subscriptionRouter = Router();

subscriptionRouter.post(
  '/create',
  authentication('admin', 'super-admin'),
  requestValidator(SubscriptionValidationZodSchema.createSubscriptionZodSchema),
  subscriptionController.createSubscription,
);
subscriptionRouter.get('/retrive/search', authentication('admin', 'super-admin'), subscriptionController.getSubscriptions);

subscriptionRouter.patch(
  '/update/:id',
  authentication('admin', 'super-admin'),
  requestValidator(SubscriptionValidationZodSchema.getSpecificSubscriptionZodSchema),
  subscriptionController.updateSpecificSubscription,
);
subscriptionRouter.delete(
  '/delete/:id',
  authentication('admin', 'super-admin'),
  requestValidator(SubscriptionValidationZodSchema.getSpecificSubscriptionZodSchema),
  subscriptionController.deleteSpecificSubscription,
);

export default subscriptionRouter;
