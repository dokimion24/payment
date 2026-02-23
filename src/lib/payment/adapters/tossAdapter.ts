// ============================================================
// Adapter Pattern - Toss 결제 어댑터
// ============================================================
// Toss API의 고유한 요청/응답 형식을 IPaymentAdapter 인터페이스에 맞게 변환합니다.
// ============================================================

import type { PaymentRequestParams, PaymentResult } from '../types';
import type { CheckoutUrlParams, IPaymentAdapter } from './types';

export class TossPaymentAdapter implements IPaymentAdapter {
  readonly name = 'Toss';

  getCheckoutUrl(params: CheckoutUrlParams): string {
    const query = new URLSearchParams({
      orderId: params.orderId,
      amount: String(params.amount),
      orderName: params.orderName,
      customerName: params.customerName ?? '',
      customerEmail: params.customerEmail ?? '',
    });
    return `/payment/checkout?${query.toString()}`;
  }

  async requestPayment(params: PaymentRequestParams): Promise<PaymentResult> {
    // TODO: 공통 파라미터를 TossPaymentRequest 형식으로 변환 후 실제 Toss API 호출
    // 현재는 시뮬레이션
    return {
      success: true,
      transactionId: `toss_${Date.now()}`,
      provider: 'TOSS',
      message: 'Toss 결제가 완료되었습니다.',
    };
  }

  async cancelPayment(transactionId: string): Promise<PaymentResult> {
    // TODO: 실제 Toss 취소 API 호출
    return {
      success: true,
      transactionId,
      provider: 'TOSS',
      message: 'Toss 결제가 취소되었습니다.',
    };
  }
}
