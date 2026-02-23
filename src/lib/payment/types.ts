// ============================================================
// 결제 시스템 공통 타입 정의
// ============================================================

/** PG사 타입 */
export const PaymentProviderType = {
  TOSS: 'TOSS',
  PAYPAL: 'PAYPAL',
  GENERAL: 'GENERAL', // 무통장입금
} as const;

export type PaymentProviderType =
  (typeof PaymentProviderType)[keyof typeof PaymentProviderType];

/** 국가 코드 */
export type CountryCode = 'KR' | 'FR' | 'US';

/** 사업자 유형 */
export type BusinessType = 'NONE' | 'INDIVIDUAL' | 'CORPORATE';

/** 결제 요청 파라미터 */
export interface PaymentRequestParams {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
}

/** 결제 컨텍스트 (Factory에서 사용) */
export interface PaymentContext {
  country: CountryCode;
  businessType: BusinessType;
}

/** 결제 결과 */
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: PaymentProviderType;
  message: string;
}
