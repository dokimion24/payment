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
    return `/payment/toss?${query.toString()}`;
  }

  async requestPayment(params: PaymentRequestParams): Promise<PaymentResult> {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return {
        success: false,
        transactionId: '',
        provider: 'TOSS',
        message: 'TOSS_SECRET_KEY가 설정되지 않았습니다.',
      };
    }

    const { paymentKey, orderId, amount } = params;

    const response = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        transactionId: '',
        provider: 'TOSS',
        message: data.message || '결제 승인에 실패했습니다.',
      };
    }

    return {
      success: true,
      transactionId: String(paymentKey),
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
