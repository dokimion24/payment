// ============================================================
// Factory Pattern - 결제 팩토리
// ============================================================
// 국가 → PG사 매핑만 담당하는 단순한 팩토리
//
// 비즈니스 규칙:
// - 한국(KR): Toss
// - 프랑스(FR): PayPal
// - 미국(US): PayPal
// - 기타: PayPal
// ============================================================

import { TossPaymentAdapter, PayPalPaymentAdapter } from "../adapters";
import type { IPaymentAdapter } from "../adapters";
import { PaymentProviderType } from "../types";
import type { CountryCode } from "../types";

// ------------------------------------------------------------
// 1. 국가 → PG사 매핑 테이블
// ------------------------------------------------------------

const { TOSS, PAYPAL } = PaymentProviderType;

const COUNTRY_PROVIDER_MAP: Record<CountryCode, PaymentProviderType[]> = {
  KR: [TOSS],
  FR: [PAYPAL],
  US: [PAYPAL],
};

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
};

// ------------------------------------------------------------
// 3. Class 구현 + DI
// ------------------------------------------------------------

interface PaymentFactoryOptions {
  countryProviderMap?: Record<CountryCode, PaymentProviderType[]>;
  defaultProviders?: PaymentProviderType[];
  adapterRegistry?: Record<PaymentProviderType, new () => IPaymentAdapter>;
}

export class PaymentFactoryImpl {
  private readonly countryProviderMap: Record<
    CountryCode,
    PaymentProviderType[]
  >;
  private readonly defaultProviders: PaymentProviderType[];
  private readonly adapterRegistry: Record<
    PaymentProviderType,
    new () => IPaymentAdapter
  >;
  private readonly adapterCache = new Map<
    PaymentProviderType,
    IPaymentAdapter
  >();

  constructor(options?: PaymentFactoryOptions) {
    this.countryProviderMap =
      options?.countryProviderMap ?? COUNTRY_PROVIDER_MAP;
    this.defaultProviders = options?.defaultProviders ?? DEFAULT_PROVIDERS;
    this.adapterRegistry = options?.adapterRegistry ?? DEFAULT_ADAPTER_REGISTRY;
  }

  getAvailableProviders(country: CountryCode): PaymentProviderType[] {
    return this.countryProviderMap[country] ?? this.defaultProviders;
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

export const PaymentFactory = new PaymentFactoryImpl();
