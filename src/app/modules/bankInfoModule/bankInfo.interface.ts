import { Document, Types } from 'mongoose';

export interface IBankInfo extends Document {
    user: Types.ObjectId;
    paypalEmail: string;
    // accountHolderName: string;
    // bankName: string;
    // branchName: string;
    // accountNumber: string;
    // routingNumber: string;
    // swiftCode: string;
    // iban: string;
    // countryCode: string;
    // accountType: string;
    // currency: string;
    isActive: boolean;
    // errorLogs: Array<{
    //     errorCode: string;
    //     errorMessage: string;
    //     timestamp: Date;
    // }>;
    createdAt: Date;
    updatedAt: Date;
}
