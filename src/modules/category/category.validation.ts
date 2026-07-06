import { z } from 'zod';

const createCategoryValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).min(2),
  }),
});

export const CategoryValidation = { createCategoryValidation };
