import { z } from 'zod';

export const createAuthorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
});

export const updateAuthorSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteAuthorSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateAuthorDTO = z.infer<typeof createAuthorSchema>['body'];
export type UpdateAuthorDTO = z.infer<typeof updateAuthorSchema>['body'];

