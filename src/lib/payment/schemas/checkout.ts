// ============================================================
// Zod Schema - Checkout 페이지 쿼리 파라미터 검증
// ============================================================
// checkout/paypal 페이지에서 받는 쿼리 파라미터를 검증하여
// 변조된 값이 결제 흐름에 유입되는 것을 방지합니다.
// ============================================================

import { z } from 'zod';

/** Toss checkout 페이지 쿼리 파라미터 */
export const TossCheckoutParamsSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+$/, '금액은 숫자여야 합니다.')
    .transform(Number)
    .pipe(z.number().positive('금액은 0보다 커야 합니다.')),
  orderName: z.string().min(1, '주문명은 필수입니다.'),
  customerName: z.string().default(''),
  customerEmail: z.string().default(''),
});

export type TossCheckoutParams = z.infer<typeof TossCheckoutParamsSchema>;

/** PayPal checkout 페이지 쿼리 파라미터 */
export const PayPalCheckoutParamsSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number.')
    .transform(Number)
    .pipe(z.number().positive('Amount must be greater than 0.')),
  currency: z.enum(['USD', 'EUR'], {
    error: 'Currency must be USD or EUR.',
  }),
  orderName: z.string().min(1, 'Order name is required.'),
  customerName: z.string().default(''),
});

export type PayPalCheckoutParams = z.infer<typeof PayPalCheckoutParamsSchema>;
