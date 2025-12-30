import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    max_loans_per_client: z.number().int().positive('Must be positive').optional(),
    loan_duration_days: z.number().int().positive('Must be positive').optional(),
    library_name: z.string().min(1, 'Library name is required').optional(),
    library_logo: z.string().nullable().optional(),
    sidebar_color: z.string().optional(),
  }),
});

export type UpdateSettingsDTO = z.infer<typeof updateSettingsSchema>['body'];

