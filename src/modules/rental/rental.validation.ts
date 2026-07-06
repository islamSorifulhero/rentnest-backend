import { z } from 'zod';

const createRentalValidation = z.object({
  body: z.object({
    propertyId: z.string({ required_error: 'Property ID is required' }),
    moveInDate: z.string().optional(),
    message: z.string().optional(),
  }),
});

const updateRentalStatusValidation = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      required_error: 'Status is required (APPROVED or REJECTED)',
    }),
  }),
});

export const RentalValidation = {
  createRentalValidation,
  updateRentalStatusValidation,
};
