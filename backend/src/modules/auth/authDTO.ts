import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    cpf: z.string().min(1, 'CPF is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type LoginDTO = z.infer<typeof loginSchema>['body'];

