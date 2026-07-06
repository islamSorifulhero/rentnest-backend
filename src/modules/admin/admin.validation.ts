import { z } from 'zod';

const updateUserStatusValidation = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'BANNED'], {
      required_error: 'Status is required (ACTIVE or BANNED)',
    }),
  }),
});

export const AdminValidation = { updateUserStatusValidation };
