// ============================================================
// Factory Pattern - 결제 팩토리
// ============================================================
// 비즈니스 규칙을 한 곳에 집중시키는 "자판기" 역할
//
// 핵심 역할:
// 1. 국가/사업자 유형에 따른 결제 수단 제한 규칙 관리
// 2. 적절한 PG 어댑터 인스턴스 반환 (캐싱)
//
// 비즈니스 규칙:
// - 한국(KR): 기본 Toss만 가능, 사업자(INDIVIDUAL/CORPORATE)는 Toss + 무통장입금
// - 프랑스(FR): PayPal만 가능
// - 미국(US): PayPal만 가능
// - 기타: PayPal만 가능
// ============================================================

import {
  TossPaymentAdapter,
  PayPalPaymentAdapter,
  GeneralPaymentAdapter,
} from '../adapters';
import type { IPaymentAdapter } from '../adapters';
import { PaymentProviderType } from '../types';
import type { PaymentContext, CountryCode, BusinessType } from '../types';

// ------------------------------------------------------------
// 1. 데이터 기반 규칙 테이블
// ------------------------------------------------------------

interface ProviderRule {
  country: CountryCode;
  businessType: BusinessType | '*';
  providers: PaymentProviderType[];
}

const { TOSS, PAYPAL, GENERAL } = PaymentProviderType;

const DEFAULT_RULES: ProviderRule[] = [
  { country: 'KR', businessType: 'INDIVIDUAL', providers: [TOSS, GENERAL] },
  { country: 'KR', businessType: 'CORPORATE', providers: [TOSS, GENERAL] },
  { country: 'KR', businessType: '*', providers: [TOSS] },
  { country: 'FR', businessType: '*', providers: [PAYPAL] },
  { country: 'US', businessType: '*', providers: [PAYPAL] },
];

const DEFAULT_PROVIDERS: PaymentProviderType[] = [PAYPAL];

// ------------------------------------------------------------
// 2. 어댑터 레지스트리
// ------------------------------------------------------------

const DEFAULT_ADAPTER_REGISTRY: Record<
  PaymentProviderType,
  new () => IPaymentAdapter
> = {
  [TOSS]: TossPaymentAdapter,
  [PAYPAL]: PayPalPaymentAdapter,
  [GENERAL]: GeneralPaymentAdapter,
};

// ------------------------------------------------------------
// 3. Class 구현 + DI
// ------------------------------------------------------------

interface PaymentFactoryOptions {
  rules?: ProviderRule[];
  defaultProviders?: PaymentProviderType[];
  adapterRegistry?: Record<PaymentProviderType, new () => IPaymentAdapter>;
}

export class PaymentFactoryImpl {
  private readonly rules: ProviderRule[];
  private readonly defaultProviders: PaymentProviderType[];
  private readonly adapterRegistry: Record<
    PaymentProviderType,
    new () => IPaymentAdapter
  >;
  private readonly adapterCache = new Map<PaymentProviderType, IPaymentAdapter>();

  constructor(options?: PaymentFactoryOptions) {
    this.rules = options?.rules ?? DEFAULT_RULES;
    this.defaultProviders = options?.defaultProviders ?? DEFAULT_PROVIDERS;
    this.adapterRegistry = options?.adapterRegistry ?? DEFAULT_ADAPTER_REGISTRY;
  }

  getAvailableProviders(context: PaymentContext): PaymentProviderType[] {
    const { country, businessType } = context;

    const matched = this.rules.find(
      (rule) =>
        rule.country === country &&
        (rule.businessType === '*' || rule.businessType === businessType),
    );

    return matched ? matched.providers : this.defaultProviders;
  }

  getAdapter(providerType: PaymentProviderType): IPaymentAdapter {
    const cached = this.adapterCache.get(providerType);
    if (cached) return cached;

    const Ctor = this.adapterRegistry[providerType];
    if (!Ctor) {
      throw new Error(`지원하지 않는 결제 수단입니다: ${providerType}`);
    }

    const adapter = new Ctor();
    this.adapterCache.set(providerType, adapter);
    return adapter;
  }
}

// 기존 API 유지 — 싱글턴 인스턴스
export const PaymentFactory = new PaymentFactoryImpl();
