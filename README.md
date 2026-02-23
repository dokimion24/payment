
디자인 패턴(Adapter, Factory, Strategy)을 활용한 결제 시스템 예제

---

## 비즈니스 규칙

| 국가 | 사업자 유형 | 결제수단 | 추가 요구사항 |
|------|------------|---------|-------------|
| KR | 일반 개인 (`NONE`) | Toss | - |
| KR | 개인/법인 사업자 | Toss | 사업자등록번호 필수 (`###-##-#####`) |
| FR | - | PayPal | USD/EUR 선택 |
| US | - | PayPal | USD/EUR 선택 |

국가→PG사 매핑은 `COUNTRY_PROVIDER_MAP`으로 관리. 국가 추가 시 한 줄만 추가하면 된다.

## 적용된 패턴

- **Adapter** — `IPaymentAdapter` 인터페이스로 Toss/PayPal API 차이를 통일. API 라우트는 어댑터에 위임만 한다.
- **Factory** — `PaymentFactoryImpl`이 국가별 PG사 선택 + 어댑터 인스턴스 캐싱. 생성자 DI로 테스트 시 mock 교체 가능.
- **Strategy** — 국가별 결제 폼 UI를 `lazy()`로 코드 스플리팅. KR은 `KrCreate`, 나머지는 `GlobalCreate`.

## 결제 흐름

### 한국 (Toss)

```
홈 → /payment/create (KrCreate)
  → POST /api/orders → orderId 발급
  → /payment/toss (토스 위젯)
  → 토스 리다이렉트 → /payment/success
  → POST /api/payment/confirm → 주문검증 → adapter.requestPayment() → PAID
```

### 해외 (PayPal)

```
홈 → /payment/create (GlobalCreate)
  → POST /api/orders → orderId 발급
  → /payment/paypal (PayPal 버튼)
  → onApprove → POST /api/payment/paypal → 주문검증 → adapter.requestPayment() → PAID
```
