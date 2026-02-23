// ============================================================
// Adapter Pattern - PayPal 결제 어댑터
// ============================================================
// PayPal API의 고유한 요청/응답 형식을 IPaymentAdapter 인터페이스에 맞게 변환합니다.
// ============================================================

import type { PaymentRequestParams, PaymentResult } from '../types';
import type { CheckoutUrlParams, IPaymentAdapter } from './types';

const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) return null;

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.access_token;
}

async function verifyPayPalOrder(orderId: string, accessToken: string) {
  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) return null;
  return response.json();
}

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
    const { orderId, amount, currency } = params;

    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return {
        success: false,
        transactionId: '',
        provider: 'PAYPAL',
        message: 'PayPal 인증에 실패했습니다.',
      };
    }

    const orderDetails = await verifyPayPalOrder(orderId, accessToken);
    if (!orderDetails || orderDetails.status !== 'COMPLETED') {
      return {
        success: false,
        transactionId: '',
        provider: 'PAYPAL',
        message: 'PayPal order verification failed.',
      };
    }

    const purchaseUnit = orderDetails.purchase_units?.[0];
    if (purchaseUnit) {
      const verifiedAmount = purchaseUnit.amount?.value;
      const verifiedCurrency = purchaseUnit.amount?.currency_code;

      if (
        verifiedAmount !== String(amount) ||
        verifiedCurrency !== currency
      ) {
        return {
          success: false,
          transactionId: '',
          provider: 'PAYPAL',
          message: 'Amount or currency mismatch.',
        };
      }
    }

    return {
      success: true,
      transactionId: orderId,
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
