import { IPayout } from './payout.interface';
import payoutServices from './payout.services';

// function for create payout
const createPayout = async (data: Partial<IPayout>) => {
  // write logic for payout to therapist bank account from payment gateway
  // for example:
  // check balance
  return await payoutServices.createPayout(data);
};

export default {
  createPayout,
};
