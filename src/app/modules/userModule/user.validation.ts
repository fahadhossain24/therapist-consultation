import z from 'zod';

// Shared validation for gender and role enums
const genderEnum = z.enum(['male', 'female', 'other'], {
  required_error: 'Gender is required!',
  invalid_type_error: 'Invalid gender type. Allowed values are male, female, or other.',
});

const roleEnum = z.enum(['patient', 'therapist'], {
  required_error: 'Role is required!',
  invalid_type_error: 'Invalid role type. Allowed values are patient or therapist.',
});

// Combined validation schema for user and profile
const createUserWithProfileZodSchema = z.object({
  body: z.object({
    // User fields
    firstName: z
      .string({
        required_error: 'First name is required!',
      })
      .min(1, 'First name must not be empty!'),
    lastName: z
      .string({
        required_error: 'Last name is required!',
      })
      .min(1, 'Last name must not be empty!'),
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email('Invalid email address!'),
    password: z
      .string({
        required_error: 'Password is required!',
      })
      .min(8, 'Password must be at least 8 characters!'),
    phone: z
      .string({
        required_error: 'Phone number is required!',
      })
      .min(10, 'Phone number must be at least 10 digits!')
      .regex(/^\d+$/, 'Phone number must only contain digits!'),
    role: roleEnum,
    isSocial: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
    fcmToken: z.string().nullable().optional(),
    verification: z
      .object({
        code: z.string().nullable().optional(),
        expireDate: z.date().nullable().optional(),
      })
      .optional(),
    // Profile fields
    profile: z
      .object({
        // Patient-specific fields
        address: z.string().optional(),
        dateOfBirth: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format!')
          .optional(),
        gender: genderEnum.optional(),
        image: z.string().optional(),

        // Therapist-specific fields
        specialty: z.string().optional(),
        subSpecialty: z.string().optional(),
        professionalSummary: z.string().optional(),
        experience: z.string().optional(),
        curriculumVitae: z.string().optional(),
        certificates: z.array(z.string()).optional(),
        brandLogo: z.string().optional(),
      })
      .partial()
      .refine(
        (data) => {
          // Ensure required profile fields based on role
          if (data.specialty || data.subSpecialty || data.professionalSummary) {
            return data.specialty && data.subSpecialty && data.professionalSummary;
          }
          return true;
        },
        {
          message: 'Therapist profile requires specialty, subSpecialty, and professionalSummary!',
        },
      )
      .optional(),
  }),
});

const getSpecificUserZodSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'id is missing in request params!',
    }),
  }),
});

const UserValidationZodSchema = {
  createUserWithProfileZodSchema,
  getSpecificUserZodSchema,
};

export default UserValidationZodSchema;
