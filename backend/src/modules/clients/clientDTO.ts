import { z } from 'zod';
import { validateCPF, validateEmail } from '../../shared/utils/validation';

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    cpf: z
      .string()
      .min(1, 'CPF is required')
      .refine((cpf) => validateCPF(cpf.replace(/\D/g, '')), {
        message: 'Invalid CPF',
      }),
    phone: z.string().min(1, 'Phone is required'),
    address: z.string().nullable().optional(), // Mantido para compatibilidade
    street: z.string().nullable().optional(),
    number: z.string().nullable().optional(),
    neighborhood: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    zip_code: z.string().nullable().optional(),
    email: z
      .string()
      .refine((email) => !email || validateEmail(email), {
        message: 'Invalid email format',
      })
      .nullable()
      .optional(),
    photo: z.string().nullable().optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    address: z.string().nullable().optional(), // Mantido para compatibilidade
    street: z.string().nullable().optional(),
    number: z.string().nullable().optional(),
    neighborhood: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    zip_code: z.string().nullable().optional(),
    email: z
      .string()
      .refine((email) => !email || validateEmail(email), {
        message: 'Invalid email format',
      })
      .nullable()
      .optional(),
    photo: z.string().nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteClientSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateClientDTO = z.infer<typeof createClientSchema>['body'];
export type UpdateClientDTO = z.infer<typeof updateClientSchema>['body'];

