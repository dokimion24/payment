// ============================================================
// Zod Schema - API Route 요청 바디 검증
// ============================================================

import { z } from 'zod';

/** Toss 결제 승인 요청 바디 */
export const TossConfirmBodySchema = z.object({
  paymentKey: z.string().min(1, 'paymentKey는 필수입니다.'),
  orderId: z.string().min(1, 'orderId는 필수입니다.'),
  amount: z.number().positive('금액은 0보다 커야 합니다.'),
});

export type TossConfirmBody = z.infer<typeof TossConfirmBodySchema>;

/** PayPal 결제 검증 요청 바디 */
export const PayPalVerifyBodySchema = z.object({
  orderId: z.string().min(1, 'orderId is required.'),
  status: z.string().min(1, 'status is required.'),
  amount: z.string().optional(),
  currency: z.string().optional(),
  payer: z.unknown().optional(),
});

export type PayPalVerifyBody = z.infer<typeof PayPalVerifyBodySchema>;
