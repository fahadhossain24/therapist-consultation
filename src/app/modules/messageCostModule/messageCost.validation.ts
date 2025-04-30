import { z } from 'zod';

const createMessageCostZodSchema = z.object({
    body: z.object({
        costPerMessage: z.object({
            currency: z.string().min(1, 'Currency is required'),
            amount: z.number().positive('Amount must be a positive number'),
        }),
        maxCharacters: z.number().positive('Max characters must be a positive number'),
    }),
});

const getSpecificMessageCostZodSchema = z.object({
    params: z.object({
        id: z.string({
            required_error: 'id is missing in request params!',
        }),
    }),
});

const MessageCostValidationZodSchema = {
    createMessageCostZodSchema,
    getSpecificMessageCostZodSchema,
};

export default MessageCostValidationZodSchema;
