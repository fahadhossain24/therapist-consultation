import { z } from 'zod';

const createSpecialityZodSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
    }),
});

const getSpecificSpecialityZodSchema = z.object({
    params: z.object({
        id: z.string({
            required_error: 'id is missing in request params!',
        }),
    }),
});

const SpecialityValidationZodSchema = {
    createSpecialityZodSchema,
    getSpecificSpecialityZodSchema,
};

export default SpecialityValidationZodSchema;
