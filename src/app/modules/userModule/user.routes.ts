import express from 'express';
import userControllers from './user.controllers';
import UserValidationZodSchema from './user.validation';
import requestValidator from '../../middlewares/requestValidator';
import authentication from '../../middlewares/authorization';

const userRouter = express.Router();

userRouter.post('/create', requestValidator(UserValidationZodSchema.createUserWithProfileZodSchema), userControllers.createUser);
userRouter.get('/retrive/all', userControllers.getAllUser);
userRouter.get('/retrive/:id', requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.getSpecificUser);
userRouter.patch(
    '/update/:id',
    authentication('patient', 'therapist', 'super-admin', 'admin'),
    requestValidator(UserValidationZodSchema.getSpecificUserZodSchema),
    userControllers.updateSpecificUser,
);
userRouter.delete(
    '/delete/:id',
    authentication('patient', 'therapist'),
    requestValidator(UserValidationZodSchema.getSpecificUserZodSchema),
    userControllers.deleteSpecificUser,
);
userRouter.patch(
    '/update/profile-picture/:id',
    authentication('patient', 'therapist'),
    requestValidator(UserValidationZodSchema.getSpecificUserZodSchema),
    userControllers.changeUserProfileImage,
);
userRouter.get('/retrive/therapists/popular', authentication('patient', 'therapist'), userControllers.getPopularTherapists);
userRouter.get(
    '/retrive/therapists/active-and-premium',
    authentication('patient', 'therapist'),
    userControllers.getActiveAndPremiumTherapists,
);
userRouter.get(
    '/retrive/therapists/speciality/:speciality',
    authentication('patient', 'therapist'),
    userControllers.getAllTherapistsBySpeciality,
);

export default userRouter;
