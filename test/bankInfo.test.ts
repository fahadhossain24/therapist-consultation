import mongoose, { ClientSession } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import BankInfo from '../src/app/modules/bankInfoModule/bankInfo.model';

// let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    // Start the in-memory MongoDB server
    //   mongoServer = await MongoMemoryServer.create();
    //   const uri = mongoServer.getUri();

    // Connect mongoose to the in-memory MongoDB server
    await mongoose.connect('mongodb+srv://fahadhossain:kSLsKmkNTNX4WAiX@cluster0.ke3aa.mongodb.net/mongoTnx_dev');
});

afterAll(async () => {
    // Disconnect mongoose and stop the in-memory MongoDB server
    await mongoose.disconnect();
    //   await mongoServer.stop();
});

describe('MongoDB Transaction Tests', () => {
    it('should activate one bank info and inactivate others in a transaction', async () => {
        const session: ClientSession = await mongoose.startSession();
        session.startTransaction();

        let transactionCommitted = false;

        try {
            // Seed the database with multiple bank info records
            const bankInfo1 = await BankInfo.create([{ accountHolderName: 'John Doe', isActive: false }], { session });
            const bankInfo2 = await BankInfo.create([{ accountHolderName: 'Jane Doe', isActive: false }], { session });

            // Inactivate all bank info
            await BankInfo.updateMany({}, { isActive: false }, { session });

            // Activate a specific bank info
            await BankInfo.updateOne({ _id: bankInfo1[0]._id }, { isActive: true }, { session });

            // Commit the transaction
            await session.commitTransaction();
            transactionCommitted = true; // Mark as committed

            // Verify the database state
            //   const activeBankInfo = await BankInfo.findOne({ isActive: true });
            //   const inactiveBankInfos = await BankInfo.find({ isActive: false });

            //   expect(activeBankInfo?.accountHolderName).toBe('John Doe'); // The correct record is activated
            //   expect(inactiveBankInfos.length).toBe(1); // All other records are inactive
        } catch (error) {
            // Rollback the transaction in case of failure
            if (!transactionCommitted) {
                // Rollback the transaction only if it hasn't been committed
                await session.abortTransaction();
            }
            throw error;
        } finally {
            session.endSession();
        }
    });

    it('should rollback changes if an error occurs during the transaction', async () => {
        const session: ClientSession = await mongoose.startSession();
        session.startTransaction();

        try {
            // Seed the database with multiple bank info records
            await BankInfo.create([{ accountHolderName: 'John Doe', isActive: false }], { session });
            await BankInfo.create([{ accountHolderName: 'Jane Doe', isActive: false }], { session });

            // Inactivate all bank info
            await BankInfo.updateMany({}, { isActive: false }, { session });

            // Simulate an error before committing the transaction
            throw new Error('Simulated error during transaction!');

            // Commit the transaction (this won't be reached)
            await session.commitTransaction();
        } catch (error) {
            // Rollback the transaction
            await session.abortTransaction();

            // Verify that the database state remains unchanged
            //   const allBankInfos = await BankInfo.find();
            //   const activeBankInfos = allBankInfos.filter((bank) => bank.isActive);

            //   expect(activeBankInfos.length).toBe(0); // No records should be active
        } finally {
            session.endSession();
        }
    });
});
