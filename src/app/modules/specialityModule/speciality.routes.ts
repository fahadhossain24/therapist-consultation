import { Router } from 'express';
import requestValidator from '../../middlewares/requestValidator';
import SpecialityValidationZodSchema from './speciality.validation';
import authentication from '../../middlewares/authorization';
import specialityController from './speciality.controller';

const specialityRouter = Router();

specialityRouter.post(
  '/create',
  authentication('admin', 'super-admin'),
  requestValidator(SpecialityValidationZodSchema.createSpecialityZodSchema),
  specialityController.createSpeciality,
);

specialityRouter.get('/retrive/search', authentication('admin', 'super-admin', 'patient', 'therapist'), specialityController.getSpecialities);

specialityRouter.patch(
  '/update/:id',
  authentication('admin', 'super-admin'),
  requestValidator(SpecialityValidationZodSchema.getSpecificSpecialityZodSchema),
  specialityController.updateSpecificSpeciality,
);

specialityRouter.delete(
  '/delete/:id',
  authentication('admin', 'super-admin'),
  requestValidator(SpecialityValidationZodSchema.getSpecificSpecialityZodSchema),
  specialityController.deleteSpecificSpeciality,
);

export default specialityRouter;
