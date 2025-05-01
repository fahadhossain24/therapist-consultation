import express from 'express';
import walletControllers from './wallet.controllers';
import authentication from '../../middlewares/authorization';

const walletRouter = express.Router();

walletRouter.get('/retrive/user/:userId', walletControllers.getSpecificWalletByUserId);

walletRouter.post('/initiate-top-up', authentication('patient'), walletControllers.initiateWalletTopUp);

walletRouter.get('/top-up/return', walletControllers.returnWalletTopUp);

walletRouter.get('/top-up/cancel', walletControllers.cancelWalletTopUp);


export default walletRouter;
