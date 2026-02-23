// ============================================================
// Zod Discriminated Union - 한국 결제 스키마
// ============================================================
// 사업자 유형(businessType)에 따라 다른 유효성 검사 규칙 적용
//
// 1. NONE(일반): 고객정보만 검증
// 2. INDIVIDUAL/CORPORATE: 고객정보 + 사업자등록번호 필수
// 3. z.discriminatedUnion으로 조건부 검증을 선언적으로 처리
// ============================================================

import { z } from 'zod';

/** 일반 개인 */
const KrNormalSchema = z.object({
  businessType: z.literal('NONE'),
  customerName: z.string().min(2, 'validation.nameMinLength'),
  customerEmail: z.string().email('validation.invalidEmail'),
  amount: z.number().positive('validation.amountPositive'),
});

/** 사업자(개인/법인) - 사업자등록번호 필수 */
const KrBusinessSchema = z.object({
  businessType: z.enum(['INDIVIDUAL', 'CORPORATE']),
  customerName: z.string().min(2, 'validation.nameMinLength'),
  customerEmail: z.string().email('validation.invalidEmail'),
  amount: z.number().positive('validation.amountPositive'),
  registrationNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, 'validation.registrationFormat'),
});

/** 한국 결제 스키마 (Discriminated Union) */
export const KrPurchaseSchema = z.discriminatedUnion('businessType', [
  KrNormalSchema,
  KrBusinessSchema,
]);

export type KrPurchaseForm = z.infer<typeof KrPurchaseSchema>;
