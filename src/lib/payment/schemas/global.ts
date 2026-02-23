// ============================================================
// Zod Schema - 글로벌 (해외) 결제 스키마
// ============================================================
// 해외 결제는 PayPal만 가능하므로 단순한 스키마
// ============================================================

import { z } from 'zod';

import { PaymentProviderType } from '../types';

export const GlobalPurchaseSchema = z.object({
  paymentMethod: z.literal(PaymentProviderType.PAYPAL),
  customerName: z.string().min(1, 'Name is required.'),
  customerEmail: z.string().email('Please enter a valid email.'),
  amount: z.number().positive('Amount must be greater than 0.'),
  currency: z.enum(['USD', 'EUR']),
});

export type GlobalPurchaseForm = z.infer<typeof GlobalPurchaseSchema>;
