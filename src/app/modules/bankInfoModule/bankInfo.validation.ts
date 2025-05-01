import { z } from 'zod';

// Regular expression for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createBankInfoZodSchema = z.object({
    body: z.object({
        user: z.string().regex(objectIdRegex, 'User ID must be a valid ObjectId'),
        paypalEmail: z.string().email('Invalid email format'),
        // accountHolderName: z.string().min(1, 'Account holder name is required'),
        // bankName: z.string().min(1, 'Bank name is required'),
        // branchName: z.string().min(1, 'Branch name is required'),
        // accountNumber: z.string().min(1, 'Account number is required'),
        // routingNumber: z.string().min(1, 'Routing number is required'),
        // swiftCode: z.string().min(1, 'SWIFT code is required'),
        // iban: z.string().min(1, 'IBAN is required'),
        // countryCode: z.string().min(1, 'Country code is required'),
        // accountType: z.string().min(1, 'Account type is required'),
        // currency: z.string().min(1, 'Currency is required'),
        isActive: z.boolean().optional(),
        // errorLogs: z
        //     .array(
        //         z.object({
        //             errorCode: z.string().min(1, 'Error code is required'),
        //             errorMessage: z.string().min(1, 'Error message is required'),
        //             timestamp: z.date().optional(),
        //         }),
        //     )
        //     .optional(),
    }),
});

const getSpecificBankInfoZodSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, 'Invalid ID format'),
    }),
});

const BankInfoValidationZodSchema = {
    createBankInfoZodSchema,
    getSpecificBankInfoZodSchema,
};

export default BankInfoValidationZodSchema;
