import { z } from 'zod';

export const CreateOrderBodySchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  orderName: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  country: z.string(),
  businessType: z.enum(['NONE', 'INDIVIDUAL', 'CORPORATE']),
  registrationNumber: z.string().optional(),
});

export type CreateOrderBody = z.infer<typeof CreateOrderBodySchema>;
