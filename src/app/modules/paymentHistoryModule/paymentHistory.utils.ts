import { IPaymentHistory } from './paymentHistory.interface';
import paymentHistoryServices from './paymentHistory.services';

// function for create payout
const createPaymentHistory = async (data: Partial<IPaymentHistory>) => {
  return await paymentHistoryServices.createPaymentHistory(data);
};

export default {
  createPaymentHistory,
};
