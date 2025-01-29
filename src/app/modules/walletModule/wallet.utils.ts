import { IWallet } from './wallet.interface';
import Wallet from './wallet.model';
import walletServices from './wallet.services';

// function for create and update specific wallet by userId
const createOrUpdateSpecificWallet = async (userId: string, data: Partial<IWallet>) => {
  return await walletServices.createOrUpdateSpecificWallet(userId, data);
};

// function for delete specfic wallet by userId
const deleteSpecificWalletByUserId = async (userId: string) => {
  return await walletServices.deleteSpecificWallet(userId);
};

export default {
  createOrUpdateSpecificWallet,
  deleteSpecificWalletByUserId,
};
