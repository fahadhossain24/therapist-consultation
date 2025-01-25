import { IPaymentHistory } from './paymentHistory.interface';
import PaymentHistory from './paymentHistory.model';

// service for create new payout
const createPaymentHistory = async (data: Partial<IPaymentHistory>) => {
  return await PaymentHistory.create(data);
};

// service for get all payouts by user id (therapist)
const getAllPaymentHistoryByUserId = async (userId: string) => {
  return await PaymentHistory.find({ user: userId });
};

//service for delete all payouts
const deleteAllPaymentHistory = async () => {
  return await PaymentHistory.deleteMany();
};

export default {
  createPaymentHistory,
  getAllPaymentHistoryByUserId,
  deleteAllPaymentHistory,
};
