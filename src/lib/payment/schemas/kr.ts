// ============================================================
// Zod Discriminated Union - 한국 결제 스키마
// ============================================================
// 사업자 유형(businessType)에 따라 다른 유효성 검사 규칙 적용
//
// 실습 포인트:
// 1. NONE(일반): Toss만 선택 가능
// 2. INDIVIDUAL/CORPORATE: Toss + 무통장입금, 사업자등록증 필수
// 3. z.discriminatedUnion으로 조건부 검증을 선언적으로 처리
// ============================================================

import { z } from 'zod';

import { PaymentProviderType } from '../types';

/** 일반 개인 - Toss만 가능 */
const KrNormalSchema = z.object({
  businessType: z.literal('NONE'),
  paymentMethod: z.literal(PaymentProviderType.TOSS),
  customerName: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  customerEmail: z.string().email('올바른 이메일을 입력하세요.'),
  amount: z.number().positive('금액은 0보다 커야 합니다.'),
});

/** 사업자(개인/법인) - Toss + 무통장입금, 사업자등록증 필수 */
const KrBusinessSchema = z.object({
  businessType: z.enum(['INDIVIDUAL', 'CORPORATE']),
  paymentMethod: z.enum([PaymentProviderType.TOSS, PaymentProviderType.GENERAL]),
  customerName: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  customerEmail: z.string().email('올바른 이메일을 입력하세요.'),
  amount: z.number().positive('금액은 0보다 커야 합니다.'),
  registrationNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, '사업자등록번호 형식: 000-00-00000'),
});

/** 한국 결제 스키마 (Discriminated Union) */
export const KrPurchaseSchema = z.discriminatedUnion('businessType', [
  KrNormalSchema,
  KrBusinessSchema,
]);

export type KrPurchaseForm = z.infer<typeof KrPurchaseSchema>;
