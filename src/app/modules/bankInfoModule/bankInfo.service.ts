import BankInfo from './bankInfo.model';
import { IBankInfo } from './bankInfo.interface';
import mongoose from 'mongoose';

class BankInfoService {
    public async createBankInfo(bankInfo: Partial<IBankInfo>) {
        const newBankInfo = new BankInfo(bankInfo);
        return await newBankInfo.save(); // No session needed here
    }

    public async getAllBankInfos() {
        return await BankInfo.find(); // No session needed here
    }

    public async getSpecificBankInfo(id: string) {
        return await BankInfo.findById(id); // No session needed here
    }

    public async getSpecificBankInfoByUserId(userId: string) {
        return await BankInfo.findOne({ user: userId });
    }

    public async updateSpecificBankInfo(id: string, data: Partial<IBankInfo>) {
        return await BankInfo.updateOne({ _id: id }, data, { runValidators: true }); // No session needed here
    }

    public async activeSpecificBankInfo(id: string, session: mongoose.ClientSession) {
        return await BankInfo.updateOne({ _id: id }, { isActive: true }, { session, runValidators: true });
    }

    public async inactiveAllBankInfo(session: mongoose.ClientSession) {
        return await BankInfo.updateMany({}, { isActive: false }, { session, runValidators: true });
    }

    public async retriveBankInfoWithTrueByBankId(id: string) {
        return await BankInfo.findOne({ _id: id, isActive: true });
    }

    public async deleteSpecificBankInfo(id: string) {
        return await BankInfo.deleteOne({ _id: id }); // No session needed here
    }
}

export default new BankInfoService();
