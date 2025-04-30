import express from 'express';
import walletControllers from './wallet.controllers';
import authentication from '../../middlewares/authorization';

const walletRouter = express.Router();

walletRouter.get('/retrive/user/:userId', walletControllers.getSpecificWalletByUserId);

walletRouter.post('/initiate-top-up', authentication('patient'), walletControllers.initiateWalletTopUp);

walletRouter.post('/add/balance', authentication('patient'), walletControllers.addBalanceToWallet);

// walletRouter.post('/add/balance/return', walletControllers.addBalanceToWallet);

// walletRouter.post('/add/balance/cencel', walletControllers.addBalanceToWallet);


export default walletRouter;
