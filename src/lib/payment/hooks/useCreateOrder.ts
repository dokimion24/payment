'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PaymentFactory } from '../factory';
import type { PaymentProviderType } from '../types';

interface OrderRequest {
  amount: number;
  currency: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  [key: string]: unknown;
}

interface UseCreateOrderOptions {
  provider: PaymentProviderType;
  fallbackError?: string;
}

export function useCreateOrder({ provider, fallbackError = 'Order creation failed.' }: UseCreateOrderOptions) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (params: OrderRequest) => {
    setError(null);
    setIsSubmitting(true);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).catch(() => null);

    if (!res) {
      setError(fallbackError);
      setIsSubmitting(false);
      return;
    }

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || fallbackError);
      setIsSubmitting(false);
      return;
    }

    const { orderId } = await res.json();
    const checkoutUrl = PaymentFactory.getAdapter(provider).getCheckoutUrl({
      orderId,
      ...params,
    });

    setIsSubmitting(false);
    if (checkoutUrl) {
      router.push(checkoutUrl);
    }
  }, [provider, fallbackError, router]);

  return { submit, isSubmitting, error };
}
