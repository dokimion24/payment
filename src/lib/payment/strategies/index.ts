// ============================================================
// Strategy Pattern - 국가별 UI 전략 매핑
// ============================================================
// lazy()로 코드 분할 + 국가별 동적 로드
// 새 국가 추가 시 여기에 매핑만 추가하면 됨 (OCP)
// ============================================================

import { lazy } from 'react';

import type { CountryCode } from '../types';

type StrategyKey = CountryCode | 'DEFAULT';

export const UI_STRATEGIES: Record<StrategyKey, React.LazyExoticComponent<React.ComponentType>> = {
  KR: lazy(() => import('./KrCreate')),
  FR: lazy(() => import('./GlobalCreate')),
  US: lazy(() => import('./GlobalCreate')),
  DEFAULT: lazy(() => import('./GlobalCreate')),
};

/** 국가에 맞는 결제 폼 컴포넌트를 반환 */
export function getPaymentStrategy(country: CountryCode) {
  return UI_STRATEGIES[country] ?? UI_STRATEGIES.DEFAULT;
}
