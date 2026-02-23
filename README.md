
디자인 패턴(Adapter, Factory, Strategy)을 활용한 결제 시스템 예제

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack)
- **React 19**, TypeScript 5
- **Zod 4** — 스키마 검증
- **next-intl** — 국제화 (한국어/영어)
- **@tosspayments/payment-widget-sdk** — 토스 결제 위젯
- **@paypal/react-paypal-js** — PayPal 버튼

## 비즈니스 규칙

| 국가 | 사업자 유형 | 결제수단 | 추가 요구사항 |
|------|------------|---------|-------------|
| KR | 일반 개인 (`NONE`) | Toss | - |
| KR | 개인/법인 사업자 | Toss | 사업자등록번호 필수 (`###-##-#####`) |
| FR | - | PayPal | USD/EUR 선택 |
| US | - | PayPal | USD/EUR 선택 |

국가→PG사 매핑은 `COUNTRY_PROVIDER_MAP` 데이터 테이블로 관리된다. 국가 추가 시 테이블에 한 줄만 추가하면 된다.

```ts
const COUNTRY_PROVIDER_MAP: Record<CountryCode, PaymentProviderType[]> = {
  KR: [TOSS],
  FR: [PAYPAL],
  US: [PAYPAL],
};
```

## 적용된 패턴

### Adapter Pattern — PG사 API 통일

PG사(Toss, PayPal)마다 인증 방식과 API가 완전히 다르지만, `IPaymentAdapter` 인터페이스로 통일한다.

```ts
interface IPaymentAdapter {
  readonly name: string;
  getCheckoutUrl(params: CheckoutUrlParams): string | null;
  requestPayment(params: PaymentRequestParams): Promise<PaymentResult>;
  cancelPayment(transactionId: string): Promise<PaymentResult>;
}
```

각 어댑터가 PG사 API 호출을 직접 담당한다:

| 어댑터 | 인증 | API 호출 |
|--------|------|---------|
| `TossPaymentAdapter` | Basic Auth (`TOSS_SECRET_KEY`) | `POST /v1/payments/confirm` |
| `PayPalPaymentAdapter` | OAuth2 Client Credentials | `GET /v2/checkout/orders/{id}` + 금액/통화 검증 |

API 라우트는 주문 검증(상태, 금액)만 하고, 실제 PG사 통신은 어댑터에 위임한다:

```ts
// /api/payment/confirm/route.ts
const adapter = PaymentFactory.getAdapter("TOSS");
const result = await adapter.requestPayment({ paymentKey, orderId, amount, ... });
```

### Factory Pattern — 생성 위임 + 비즈니스 규칙 격리

`PaymentFactoryImpl` 클래스가 국가별 PG사 선택과 어댑터 인스턴스 관리를 담당한다.

```ts
class PaymentFactoryImpl {
  getAvailableProviders(country: CountryCode): PaymentProviderType[];
  getAdapter(providerType: PaymentProviderType): IPaymentAdapter;
}
```

- **어댑터 캐싱** — `Map`으로 한 번 생성한 어댑터를 재사용
- **DI 지원** — 생성자로 `countryProviderMap`, `adapterRegistry`를 주입할 수 있어 테스트 시 mock 교체가 쉬움

```ts
// 프로덕션
export const PaymentFactory = new PaymentFactoryImpl();

// 테스트
const testFactory = new PaymentFactoryImpl({
  adapterRegistry: { TOSS: MockTossAdapter, PAYPAL: MockPayPalAdapter },
});
```

### Strategy Pattern — 국가별 UI 동적 로드

국가마다 결제 폼 UI가 다르다. `lazy()`로 코드 스플리팅하여 필요한 폼만 로드한다.

```ts
const UI_STRATEGIES = {
  KR: lazy(() => import('./KrCreate')),      // 사업자 유형 선택 + 등록번호 입력
  FR: lazy(() => import('./GlobalCreate')),   // 단순 PayPal 폼
  US: lazy(() => import('./GlobalCreate')),
  DEFAULT: lazy(() => import('./GlobalCreate')),
};
```

- **KrCreate** — 사업자 유형 라디오 버튼, 조건부 사업자등록번호 필드, `KrPurchaseSchema`로 검증
- **GlobalCreate** — 통화 선택(USD/EUR), `GlobalPurchaseSchema`로 검증

## 데이터 검증 (Zod)

스키마를 용도별로 분리하여 관리한다:

| 스키마 | 파일 | 용도 |
|--------|------|------|
| `KrPurchaseSchema` | `schemas/kr.ts` | 한국 결제 폼 검증 (discriminatedUnion) |
| `GlobalPurchaseSchema` | `schemas/global.ts` | 해외 결제 폼 검증 |
| `TossCheckoutParamsSchema` | `schemas/checkout.ts` | 토스 체크아웃 쿼리 파라미터 |
| `PayPalCheckoutParamsSchema` | `schemas/checkout.ts` | PayPal 체크아웃 쿼리 파라미터 |
| `TossConfirmBodySchema` | `schemas/api.ts` | 토스 승인 API 요청 바디 |
| `PayPalVerifyBodySchema` | `schemas/api.ts` | PayPal 검증 API 요청 바디 |
| `CreateOrderBodySchema` | `schemas/order.ts` | 주문 생성 API 요청 바디 |

한국 결제는 `discriminatedUnion`으로 사업자 유형별 규칙이 분기된다:

```ts
const KrPurchaseSchema = z.discriminatedUnion('businessType', [
  KrNormalSchema,    // NONE → 기본 필드만
  KrBusinessSchema,  // INDIVIDUAL | CORPORATE → 사업자등록번호 필수
]);
```

잘못된 조합(일반 개인인데 사업자등록번호 입력 등)은 스키마 레벨에서 자동 차단된다.

## 결제 흐름

### 한국 (Toss)

```
홈 (/) — 국가: KR, 상품 담기
  │
  ├─ /payment/create?country=KR&amount=189000&orderName=...
  │    └─ Strategy: KrCreate 로드
  │    └─ 사업자 유형/등록번호 입력, KrPurchaseSchema 검증
  │    └─ useCreateOrder → POST /api/orders → orderId 발급
  │    └─ adapter.getCheckoutUrl() → /payment/toss?orderId=...
  │
  ├─ /payment/toss — 토스 위젯 렌더링, 카드/계좌 선택
  │    └─ 토스 SDK requestPayment() → 성공 시 리다이렉트
  │
  ├─ /payment/success?paymentKey=...&orderId=...&amount=...
  │    └─ POST /api/payment/confirm
  │         ├─ 주문 조회 (getOrder) — 상태 PENDING 확인, 금액 일치 확인
  │         ├─ PaymentFactory.getAdapter("TOSS").requestPayment()
  │         │    └─ 토스 API /v1/payments/confirm 호출
  │         ├─ 성공 → updateOrderStatus("PAID")
  │         └─ 결과 반환
  │
  └─ /payment/fail?code=...&message=... (실패 시)
```

### 해외 (PayPal)

```
홈 (/) — 국가: US, 상품 담기
  │
  ├─ /payment/create?country=US&amount=149.99&currency=USD&orderName=...
  │    └─ Strategy: GlobalCreate 로드
  │    └─ GlobalPurchaseSchema 검증
  │    └─ useCreateOrder → POST /api/orders → orderId 발급
  │    └─ adapter.getCheckoutUrl() → /payment/paypal?orderId=...
  │
  ├─ /payment/paypal — PayPal 버튼 렌더링
  │    └─ PayPal SDK createOrder → onApprove → capture
  │    └─ POST /api/payment/paypal
  │         ├─ 주문 조회 (getOrder) — 상태 PENDING 확인
  │         ├─ PaymentFactory.getAdapter("PAYPAL").requestPayment()
  │         │    └─ OAuth2 토큰 발급 → Order 검증 → 금액/통화 비교
  │         ├─ 성공 → updateOrderStatus("PAID")
  │         └─ 결과 반환
  │
  └─ 결제 완료 메시지 (PayPal 페이지 내 표시)
```

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                          # 홈 — 상품 목록, 장바구니, 국가 선택
│   ├── settings/page.tsx                 # 사업자 유형 설정 (localStorage)
│   ├── api/
│   │   ├── orders/route.ts               # POST /api/orders — 주문 생성
│   │   └── payment/
│   │       ├── confirm/route.ts          # POST — Toss 결제 승인
│   │       └── paypal/route.ts           # POST — PayPal 결제 검증
│   └── payment/
│       ├── create/page.tsx               # 결제 폼 (Strategy로 국가별 분기)
│       ├── toss/page.tsx                 # 토스 위젯 체크아웃
│       ├── paypal/page.tsx               # PayPal 버튼 체크아웃
│       ├── success/page.tsx              # 결제 성공
│       └── fail/page.tsx                 # 결제 실패
├── lib/
│   ├── payment/
│   │   ├── types.ts                      # 공통 타입 (PaymentProviderType, PaymentResult 등)
│   │   ├── adapters/                     # Adapter Pattern
│   │   │   ├── types.ts                  #   IPaymentAdapter 인터페이스
│   │   │   ├── tossAdapter.ts            #   Toss 결제 어댑터
│   │   │   └── paypalAdapter.ts          #   PayPal 결제 어댑터
│   │   ├── factory/                      # Factory Pattern
│   │   │   └── paymentFactory.ts         #   PaymentFactoryImpl (DI, 캐싱)
│   │   ├── strategies/                   # Strategy Pattern
│   │   │   ├── KrCreate.tsx              #   한국 결제 폼
│   │   │   └── GlobalCreate.tsx          #   해외 결제 폼
│   │   ├── schemas/                      # Zod 검증 스키마
│   │   │   ├── kr.ts                     #   한국 (discriminatedUnion)
│   │   │   ├── global.ts                 #   해외
│   │   │   ├── checkout.ts               #   체크아웃 쿼리 파라미터
│   │   │   ├── api.ts                    #   API 요청 바디
│   │   │   └── order.ts                  #   주문 생성
│   │   ├── orders/store.ts               # 주문 저장소 (in-memory)
│   │   ├── hooks/useCreateOrder.ts       # 주문 생성 + 체크아웃 라우팅 훅
│   │   └── components/PaymentForm.tsx    # 공통 폼 컴포넌트
│   ├── hooks/
│   │   ├── useBusinessType.ts            # 사업자 유형 (localStorage + useSyncExternalStore)
│   │   └── useCart.ts                    # 장바구니 (국가별 가격)
│   ├── products.ts                       # 상품 데이터 (KRW/USD 이중 가격)
│   └── i18n/                             # 국제화 설정
└── messages/
    ├── ko.json                           # 한국어 메시지
    └── en.json                           # 영어 메시지
```

## 환경 변수

| 변수 | 용도 |
|------|------|
| `TOSS_SECRET_KEY` | 토스 API 시크릿 키 (Basic Auth) |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 위젯 클라이언트 키 |
| `PAYPAL_CLIENT_ID` | PayPal OAuth2 Client ID |
| `PAYPAL_SECRET` | PayPal OAuth2 Secret |
| `PAYPAL_API_BASE` | PayPal API 베이스 URL (기본: sandbox) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal 클라이언트 SDK용 |
