import { IPayout } from './payout.interface';
import Payout from './payout.model';

// service for create new payout
const createPayout = async (data: Partial<IPayout>) => {
    return await Payout.create(data);
};

// service for get all payouts by user id (therapist)
const getAllPayoutsByTherapist = async (userId: string) => {
    return await Payout.find({ user: userId });
};

// service for get all payouts by bank info id
const getAllPayoutsByBankInfo = async (bankInfoId: string) => {
    return await Payout.find({ 'transferdSource.bankInfo': bankInfoId });
};

//service for delete all payouts
const deleteAllPayouts = async () => {
    return await Payout.deleteMany();
};

export default {
    createPayout,
    getAllPayoutsByTherapist,
    getAllPayoutsByBankInfo,
    deleteAllPayouts,
};
