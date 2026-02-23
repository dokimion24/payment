import { lazy } from 'react';

import type { CountryCode } from '../types';

type StrategyKey = CountryCode | 'DEFAULT';

const UI_STRATEGIES: Record<StrategyKey, React.LazyExoticComponent<React.ComponentType>> = {
  KR: lazy(() => import('./KrCreate')),
  FR: lazy(() => import('./GlobalCreate')),
  US: lazy(() => import('./GlobalCreate')),
  DEFAULT: lazy(() => import('./GlobalCreate')),
};

export function getPaymentStrategy(country: CountryCode) {
  return UI_STRATEGIES[country] ?? UI_STRATEGIES.DEFAULT;
}
