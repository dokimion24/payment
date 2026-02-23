// ============================================================
// 결제 시스템 공통 타입 정의
// ============================================================

/** PG사 타입 */
export const PaymentProviderType = {
  TOSS: 'TOSS',
  PAYPAL: 'PAYPAL',
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
  [key: string]: unknown; // PG사별 추가 필드 (paymentKey 등)
}

/** 결제 결과 */
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: PaymentProviderType;
  message: string;
}
