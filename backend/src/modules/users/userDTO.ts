import { z } from 'zod';
import { validateCPF, validateEmail } from '../../shared/utils/validation';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    cpf: z
      .string()
      .min(1, 'CPF is required')
      .refine((cpf) => validateCPF(cpf.replace(/\D/g, '')), {
        message: 'Invalid CPF',
      }),
    phone: z.string().min(1, 'Phone is required'),
    address: z.string().min(1, 'Address is required'),
    email: z
      .string()
      .refine((email) => !email || validateEmail(email), {
        message: 'Invalid email format',
      })
      .nullable()
      .optional(),
    photo: z.string().nullable().optional(),
    role: z.enum(['ADMIN', 'USER']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    photo: z.string().nullable().optional(),
    password: z.string().min(6).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    cpf: z
      .string()
      .min(1)
      .refine((cpf) => validateCPF(cpf.replace(/\D/g, '')), {
        message: 'Invalid CPF',
      })
      .optional(),
    phone: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    email: z
      .string()
      .refine((email) => !email || validateEmail(email), {
        message: 'Invalid email format',
      })
      .nullable()
      .optional(),
    photo: z.string().nullable().optional(),
    password: z.string().min(6).optional(),
  }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDTO = z.infer<typeof updateUserSchema>['body'];
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>['body'];

