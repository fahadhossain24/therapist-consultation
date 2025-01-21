import { z } from 'zod';

const createSubscriptionZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.object({
      currency: z.string().min(1, 'Currency is required'),
      amount: z.number().positive('Amount must be a positive number'),
    }),
    validity: z.object({
      type: z.enum(['months', 'years']),
      value: z.number().positive('Value must be a positive number'),
    }),
    features: z.array(z.string()).nonempty('At least one feature is required'),
  }),
});

const getSpecificSubscriptionZodSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'id is missing in request params!',
    }),
  }),
});

const SubscriptionValidationZodSchema = {
  createSubscriptionZodSchema,
  getSpecificSubscriptionZodSchema,
};

export default SubscriptionValidationZodSchema;
