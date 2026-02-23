
디자인 패턴(Adapter, Factory, Strategy)을 활용한 결제 시스템 예제

---

## 비즈니스 규칙

| 국가 | 조건 | 결제수단 |
|------|------|---------|
| KR | 개인/법인 사업자 | Toss, 무통장입금 |
| KR | 일반 개인 | Toss |
| FR, US | - | PayPal |

## 적용된 패턴

### Adapter
PG사(Toss, PayPal, 무통장입금)마다 API가 다르지만 `IPaymentAdapter` 인터페이스로 통일.
컴포넌트는 어떤 PG사인지 몰라도 동일한 메서드(`requestPayment`, `cancelPayment`, `getCheckoutUrl`)로 호출할 수 있다.

### Factory
국가/사업자 유형 조합에 따라 어떤 결제수단을 쓸 수 있는지 판단하는 비즈니스 규칙을 한 곳에 집중.
`getAvailableProviders()`로 허용 목록을 받고, `getAdapter()`로 해당 PG의 어댑터를 꺼낸다.
규칙은 데이터 테이블(`PROVIDER_RULES`)로 관리되어 국가 추가 시 배열에 한 줄만 추가하면 된다.

### Strategy
국가별로 결제 UI가 다르다(한국은 사업자 유형 선택 + 사업자등록번호 입력, 해외는 단순 PayPal 폼).
`lazy()`로 국가별 컴포넌트를 동적 로드해서 코드 스플리팅도 적용.

## 데이터 검증 (Zod)

한국 결제는 `discriminatedUnion`으로 사업자 유형별 검증 규칙이 분기된다.
- `NONE` → Toss만 선택 가능
- `INDIVIDUAL` / `CORPORATE` → Toss 또는 무통장입금, 사업자등록번호 필수

잘못된 조합(일반 개인 + 무통장입금)은 스키마 레벨에서 자동 차단.

## 흐름

```
page.tsx — 국가 선택, 상품 담기, 주문하기 클릭
  → Factory.getAvailableProviders() — 해당 국가에서 쓸 수 있는 결제수단 확인
  → Factory.getAdapter() — 선택된 PG의 어댑터 반환
  → adapter.getCheckoutUrl() — 결제 페이지로 이동
  → /api/payment/confirm — 서버에서 Toss 승인 API 호출
```

