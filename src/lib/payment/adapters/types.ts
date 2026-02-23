// ============================================================
// Adapter Pattern - 공통 인터페이스
// ============================================================
// 각 PG사(Toss, PayPal 등)가 구현해야 할 통일된 인터페이스
// 서로 다른 PG사 API를 동일한 방식으로 호출할 수 있게 해줍니다.
// ============================================================

import type { PaymentRequestParams, PaymentResult } from '../types';

/** checkout 페이지로 라우팅하기 위한 파라미터 */
export interface CheckoutUrlParams {
  orderId: string;
  amount: number;
  currency: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
}

export interface IPaymentAdapter {
  /** PG사 이름 */
  readonly name: string;

  /** 결제 페이지 URL 생성 — 클라이언트에서 라우팅에 사용. 별도 페이지가 없으면 null */
  getCheckoutUrl(params: CheckoutUrlParams): string | null;

  /** 결제 승인/검증 — PG사 API를 호출하여 결제를 확정한다 */
  requestPayment(params: PaymentRequestParams): Promise<PaymentResult>;

  /** 결제 취소 */
  cancelPayment(transactionId: string): Promise<PaymentResult>;
}
