import { z } from 'zod';

const createReviewValidation = z.object({
  body: z.object({
    propertyId: z.string({ required_error: 'Property ID is required' }),
    rating: z.number({ required_error: 'Rating is required' }).int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = { createReviewValidation };