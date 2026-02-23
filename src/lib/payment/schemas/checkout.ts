// ============================================================
// Zod Schema - Checkout 페이지 쿼리 파라미터 검증
// ============================================================
// checkout/paypal 페이지에서 받는 쿼리 파라미터를 검증하여
// 변조된 값이 결제 흐름에 유입되는 것을 방지합니다.
// ============================================================

import { z } from 'zod';

/** Toss checkout 페이지 쿼리 파라미터 */
export const TossCheckoutParamsSchema = z.object({
  orderId: z.string().min(1, 'validation.orderIdRequired'),
  amount: z
    .string()
    .regex(/^\d+$/, 'validation.amountMustBeNumber')
    .transform(Number)
    .pipe(z.number().positive('validation.amountPositive')),
  orderName: z.string().min(1, 'validation.orderNameRequired'),
  customerName: z.string().default(''),
  customerEmail: z.string().default(''),
});

export type TossCheckoutParams = z.infer<typeof TossCheckoutParamsSchema>;

/** PayPal checkout 페이지 쿼리 파라미터 */
export const PayPalCheckoutParamsSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'validation.amountInvalid')
    .transform(Number)
    .pipe(z.number().positive('validation.amountPositivePaypal')),
  currency: z.enum(['USD', 'EUR'], {
    error: 'validation.currencyInvalid',
  }),
  orderName: z.string().min(1, 'validation.orderNameRequiredEn'),
  customerName: z.string().default(''),
});

export type PayPalCheckoutParams = z.infer<typeof PayPalCheckoutParamsSchema>;
