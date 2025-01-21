import { Router } from 'express';
import messageCostController from './messageCost.controller';
import requestValidator from '../../middlewares/requestValidator';
import MessageCostValidationZodSchema from './messageCost.validation';
import authentication from '../../middlewares/authorization';

const messageCostRouter = Router();

messageCostRouter.post('/create', authentication('admin', 'super-admin'), requestValidator(MessageCostValidationZodSchema.createMessageCostZodSchema), messageCostController.createMessageCost);
messageCostRouter.get('/retrive', authentication('admin', 'super-admin'), messageCostController.getMessageCosts);

messageCostRouter.patch(
    '/update/:id',
    authentication('admin', 'super-admin'),
    requestValidator(MessageCostValidationZodSchema.getSpecificMessageCostZodSchema),
    messageCostController.updateSpecificMessageCost,
  );
  
  messageCostRouter.delete(
    '/delete/:id',
    authentication('admin', 'super-admin'),
    requestValidator(MessageCostValidationZodSchema.getSpecificMessageCostZodSchema),
    messageCostController.deleteSpecificMessageCost,
  );
export default messageCostRouter;
