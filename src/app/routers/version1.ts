import express from 'express';
import userRouter from '../modules/userModule/user.routes';
import adminRouter from '../modules/adminModule/admin.routes';
import userAuthRouter from '../modules/authModule/userAuthModule/auth.routes';
import adminAuthRouter from '../modules/authModule/adminAuthModule/auth.routes';
import aboutUsRouter from '../modules/aboutUsModule/abountUs.routes';
import privacyPolicyRouter from '../modules/privacyPolicyModule/privacyPolicy.routes';
import termsConditionRouter from '../modules/termsConditionModule/termsCondition.routes';
import sliderRouter from '../modules/sliderModule/slider.routes';
import specialityRouter from '../modules/specialityModule/speciality.routes';
import subscriptionRouter from '../modules/subscriptionModule/subscription.routes';
import messageCostRouter from '../modules/messageCostModule/messageCost.routes';
import notificationRouter from '../modules/notificationModule/notification.routes';

const routersVersionOne = express.Router();

// user
routersVersionOne.use('/user', userRouter);
routersVersionOne.use('/admin', adminRouter);

// auth
routersVersionOne.use('/user/auth', userAuthRouter);
routersVersionOne.use('/admin/auth', adminAuthRouter);

// app
routersVersionOne.use('/notification', notificationRouter)

// settings
routersVersionOne.use('/slider', sliderRouter)
routersVersionOne.use('/about-us', aboutUsRouter)
routersVersionOne.use('/privacy-policy', privacyPolicyRouter)
routersVersionOne.use('/terms-condition', termsConditionRouter)

// admin
routersVersionOne.use('/speciality', specialityRouter)
routersVersionOne.use('/subscription', subscriptionRouter)
routersVersionOne.use('/messageCost', messageCostRouter)


export default routersVersionOne;
