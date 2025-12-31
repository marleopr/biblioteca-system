import { z } from 'zod';

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    author_id: z.string().uuid('Invalid author ID'),
    category_id: z.string().uuid('Invalid category ID'),
    photo: z.string().nullable().optional(),
    origin: z.string().nullable().optional(),
    acquisition_type: z.enum(['DONATION', 'PURCHASE']),
    total_quantity: z.number().int().positive('Total quantity must be positive'),
    barcode: z.string().nullable().optional(),
    inventory_number: z.string().nullable().optional(),
    edition: z.string().nullable().optional(),
    cover_type: z.enum(['SOFTCOVER', 'HARDCOVER']).nullable().optional(),
    isbn: z.string().nullable().optional(),
  }),
});

export const updateBookSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    author_id: z.string().uuid().optional(),
    category_id: z.string().uuid().optional(),
    photo: z.string().nullable().optional(),
    origin: z.string().nullable().optional(),
    acquisition_type: z.enum(['DONATION', 'PURCHASE']).optional(),
    total_quantity: z.number().int().positive().optional(),
    barcode: z.string().nullable().optional(),
    inventory_number: z.string().nullable().optional(),
    edition: z.string().nullable().optional(),
    cover_type: z.enum(['SOFTCOVER', 'HARDCOVER']).nullable().optional(),
    isbn: z.string().nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteBookSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateBookDTO = z.infer<typeof createBookSchema>['body'];
export type UpdateBookDTO = z.infer<typeof updateBookSchema>['body'];

