import { Router } from 'express';
import bankInfoController from './bankInfo.controller';
import requestValidator from '../../middlewares/requestValidator';
import BankInfoValidationZodSchema from './bankInfo.validation';
import authentication from '../../middlewares/authorization';

const bankInfoRouter = Router();

bankInfoRouter.post(
    '/create',
    authentication('admin', 'super-admin', 'therapist'),
    requestValidator(BankInfoValidationZodSchema.createBankInfoZodSchema),
    bankInfoController.createBankInfo,
);

bankInfoRouter.get(
    '/retrive',
    authentication('admin', 'super-admin', 'therapist'),
    bankInfoController.getBankInfos,
);

bankInfoRouter.get(
    '/retrive/:id',
    authentication('admin', 'super-admin', 'therapist'),
    requestValidator(BankInfoValidationZodSchema.getSpecificBankInfoZodSchema),
    bankInfoController.getSpecificBankInfo,
);

bankInfoRouter.patch(
    '/update/:id',
    authentication('admin', 'super-admin', 'therapist'),
    requestValidator(BankInfoValidationZodSchema.getSpecificBankInfoZodSchema),
    bankInfoController.updateSpecificBankInfo,
);

bankInfoRouter.delete(
    '/delete/:id',
    authentication('admin', 'super-admin', 'therapist'),
    requestValidator(BankInfoValidationZodSchema.getSpecificBankInfoZodSchema),
    bankInfoController.deleteSpecificBankInfo,
);

bankInfoRouter.patch(
    '/active/:id',
    authentication('admin', 'super-admin', 'therapist'),
    requestValidator(BankInfoValidationZodSchema.getSpecificBankInfoZodSchema),
    bankInfoController.activeSpecificBankInfo,
);

export default bankInfoRouter;
