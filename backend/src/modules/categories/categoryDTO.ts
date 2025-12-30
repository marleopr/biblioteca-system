import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>['body'];

