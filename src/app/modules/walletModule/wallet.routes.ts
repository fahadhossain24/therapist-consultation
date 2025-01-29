import express from 'express';
import walletControllers from './wallet.controllers';

const walletRouter = express.Router();

walletRouter.get('/retrive/user/:userId', walletControllers.getSpecificWalletByUserId);

export default walletRouter;
