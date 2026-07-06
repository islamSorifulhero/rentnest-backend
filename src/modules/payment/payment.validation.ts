import { z } from 'zod';

const createPaymentValidation = z.object({
  body: z.object({
    rentalRequestId: z.string({ required_error: 'Rental request ID is required' }),
  }),
});

export const PaymentValidation = { createPaymentValidation };
