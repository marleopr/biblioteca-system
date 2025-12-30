import { z } from 'zod';

export const createLoanSchema = z.object({
  body: z.object({
    client_id: z.string().uuid('Invalid client ID'),
    book_id: z.string().uuid('Invalid book ID'),
    condition_on_loan: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']),
    notes: z.string().nullable().optional(),
  }),
});

export const returnLoanSchema = z.object({
  body: z.object({
    condition_on_return: z.enum(['NEW', 'GOOD', 'FAIR', 'DAMAGED']),
    notes: z.string().nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateLoanDTO = z.infer<typeof createLoanSchema>['body'];
export type ReturnLoanDTO = z.infer<typeof returnLoanSchema>['body'];

