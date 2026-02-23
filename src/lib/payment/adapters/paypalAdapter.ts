// ============================================================
// Adapter Pattern - PayPal 결제 어댑터
// ============================================================
// PayPal API의 고유한 요청/응답 형식을 IPaymentAdapter 인터페이스에 맞게 변환합니다.
// ============================================================

import type { PaymentRequestParams, PaymentResult } from '../types';
import type { CheckoutUrlParams, IPaymentAdapter } from './types';

export class PayPalPaymentAdapter implements IPaymentAdapter {
  readonly name = 'PayPal';

  getCheckoutUrl(params: CheckoutUrlParams): string {
    const query = new URLSearchParams({
      orderId: params.orderId,
      amount: params.amount.toFixed(2),
      currency: params.currency,
      orderName: params.orderName,
      customerName: params.customerName ?? '',
    });
    return `/payment/paypal?${query.toString()}`;
  }

  async requestPayment(params: PaymentRequestParams): Promise<PaymentResult> {
    // TODO: 공통 파라미터를 PayPalPaymentRequest 형식으로 변환 후 실제 PayPal API 호출
    // 현재는 시뮬레이션
    return {
      success: true,
      transactionId: `paypal_${Date.now()}`,
      provider: 'PAYPAL',
      message: 'PayPal 결제가 완료되었습니다.',
    };
  }

  async cancelPayment(transactionId: string): Promise<PaymentResult> {
    // TODO: 실제 PayPal 취소 API 호출
    return {
      success: true,
      transactionId,
      provider: 'PAYPAL',
      message: 'PayPal 결제가 취소되었습니다.',
    };
  }
}
