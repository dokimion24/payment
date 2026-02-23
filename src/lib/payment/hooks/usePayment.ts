// ============================================================
// usePayment Hook - 모든 패턴을 통합하는 단일 인터페이스
// ============================================================
// Factory에서 규칙 확인 → Adapter로 실행 → 결과 반환
//
// 컴포넌트는 이 Hook만 알면 되고,
// 내부 패턴(Factory, Adapter)은 알 필요가 없습니다.
// ============================================================

'use client';

import { useCallback, useState } from 'react';

import { PaymentFactory } from '../factory';
import type { IPaymentAdapter } from '../adapters';
import type {
  PaymentContext,
  PaymentProviderType,
  PaymentRequestParams,
  PaymentResult,
} from '../types';

interface UsePaymentReturn {
  /** 사용 가능한 결제 수단 조회 */
  getAvailableProviders: (context: PaymentContext) => PaymentProviderType[];
  /** PG 타입에 맞는 어댑터 인스턴스 반환 */
  getAdapter: (providerType: PaymentProviderType) => IPaymentAdapter;
  /** 결제 요청 */
  requestPayment: (
    context: PaymentContext,
    providerType: PaymentProviderType,
    params: PaymentRequestParams,
  ) => Promise<PaymentResult>;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: string | null;
  /** 마지막 결제 결과 */
  result: PaymentResult | null;
}

export function usePayment(): UsePaymentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const getAvailableProviders = useCallback((context: PaymentContext) => {
    return PaymentFactory.getAvailableProviders(context);
  }, []);

  const getAdapter = useCallback((providerType: PaymentProviderType) => {
    return PaymentFactory.getAdapter(providerType);
  }, []);

  const requestPayment = useCallback(
    async (
      context: PaymentContext,
      providerType: PaymentProviderType,
      params: PaymentRequestParams,
    ): Promise<PaymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Factory에서 비즈니스 규칙 검증
        const allowed = PaymentFactory.getAvailableProviders(context);
        if (!allowed.includes(providerType)) {
          throw new Error(
            `현재 컨텍스트에서 지원하지 않는 결제 수단입니다: ${providerType}`,
          );
        }

        // 2. Factory에서 적절한 Adapter 가져오기
        const adapter = PaymentFactory.getAdapter(providerType);

        // 3. Adapter로 결제 실행
        const paymentResult = await adapter.requestPayment(params);
        setResult(paymentResult);
        return paymentResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : '결제 중 오류가 발생했습니다.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    getAvailableProviders,
    getAdapter,
    requestPayment,
    isLoading,
    error,
    result,
  };
}
