// ============================================================
// Adapter Pattern - 무통장입금 어댑터
// ============================================================
// 무통장입금(계좌이체)은 PG사 API가 아닌 자체 시스템이지만,
// 동일한 IPaymentAdapter 인터페이스를 구현하여 일관된 방식으로 처리합니다.
// ============================================================

import type { PaymentRequestParams, PaymentResult } from '../types';
import type { CheckoutUrlParams, IPaymentAdapter } from './types';

export class GeneralPaymentAdapter implements IPaymentAdapter {
  readonly name = '무통장입금';

  getCheckoutUrl(_params: CheckoutUrlParams): null {
    // 무통장입금은 별도 checkout 페이지 없이 requestPayment로 직접 처리
    return null;
  }

  async requestPayment(params: PaymentRequestParams): Promise<PaymentResult> {
    // 가상계좌 생성 시뮬레이션
    const virtualAccount = {
      bank: '신한은행',
      accountNumber: `9180-${Math.random().toString().slice(2, 12)}`,
      holder: '(주)커머스',
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return {
      success: true,
      transactionId: `general_${Date.now()}`,
      provider: 'GENERAL',
      message: `가상계좌가 발급되었습니다. ${virtualAccount.bank} ${virtualAccount.accountNumber}`,
    };
  }

  async cancelPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      provider: 'GENERAL',
      message: '무통장입금이 취소되었습니다.',
    };
  }
}
