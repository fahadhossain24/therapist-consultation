import express from "express";
import userControllers from "./user.controllers";
import UserValidationZodSchema from "./user.validation";
import requestValidator from "../../middlewares/requestValidator";
import authentication from "../../middlewares/authorization";

const userRouter = express.Router();

userRouter.post('/create', requestValidator(UserValidationZodSchema.createUserWithProfileZodSchema), userControllers.createUser)
userRouter.get('/retrive/all', userControllers.getAllUser)
userRouter.get('/retrive/:id', requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.getSpecificUser)
userRouter.patch('/update/:id', authentication('patient', 'therapist'), requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.updateSpecificUser)
userRouter.delete('/delete/:id', authentication('patient', 'therapist'), requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.deleteSpecificUser)
userRouter.patch('/update/profile-picture/:id', authentication('patient', 'therapist'), requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.changeUserProfileImage)

export default userRouter


