import { z } from 'zod';

const createPropertyValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3),
    description: z.string({ required_error: 'Description is required' }).min(10),
    location: z.string({ required_error: 'Location is required' }),
    price: z.number({ required_error: 'Price is required' }).positive(),
    propertyType: z.string({ required_error: 'Property type is required' }),
    bedrooms: z.number().int().positive().optional(),
    bathrooms: z.number().int().positive().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    categoryId: z.string({ required_error: 'Category is required' }),
  }),
});

const updatePropertyValidation = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().optional(),
    price: z.number().positive().optional(),
    propertyType: z.string().optional(),
    bedrooms: z.number().int().positive().optional(),
    bathrooms: z.number().int().positive().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.string().optional(),
  }),
});

export const PropertyValidation = {
  createPropertyValidation,
  updatePropertyValidation,
};
