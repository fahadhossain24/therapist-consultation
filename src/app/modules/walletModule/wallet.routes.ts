import express from 'express';
import walletControllers from './wallet.controllers';

const walletRouter = express.Router();

walletRouter.get('/retrive/user/:userId', walletControllers.getSpecificWalletByUserId);

walletRouter.post('/add/balance', walletControllers.addBalanceToWallet);

export default walletRouter;
