import express from 'express';
import userRouter from '../modules/userModule/user.routes';
import adminRouter from '../modules/adminModule/admin.routes';
import userAuthRouter from '../modules/authModule/userAuthModule/auth.routes';
import adminAuthRouter from '../modules/authModule/adminAuthModule/auth.routes';
import aboutUsRouter from '../modules/aboutUsModule/abountUs.routes';
import privacyPolicyRouter from '../modules/privacyPolicyModule/privacyPolicy.routes';
import termsConditionRouter from '../modules/termsConditionModule/termsCondition.routes';
import sliderRouter from '../modules/sliderModule/slider.routes';

const routersVersionOne = express.Router();

// user
routersVersionOne.use('/user', userRouter);
routersVersionOne.use('/admin', adminRouter);

// auth
routersVersionOne.use('/user/auth', userAuthRouter);
routersVersionOne.use('/admin/auth', adminAuthRouter);

// settings
routersVersionOne.use('/slider', sliderRouter)
routersVersionOne.use('/about-us', aboutUsRouter)
routersVersionOne.use('/privacy-policy', privacyPolicyRouter)
routersVersionOne.use('/terms-condition', termsConditionRouter)

export default routersVersionOne;
