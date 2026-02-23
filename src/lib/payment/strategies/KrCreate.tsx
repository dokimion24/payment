"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  PaymentFormFields,
  PaymentFormLayout,
  PaymentError,
  ValidationErrors,
} from "../components/PaymentForm";
import { usePayment } from "../hooks";
import { KrPurchaseSchema } from "../schemas";
import type { BusinessType, PaymentProviderType } from "../types";

const PROVIDER_LABELS: Record<string, string> = {
  TOSS: "Toss 간편결제",
  GENERAL: "무통장입금",
};

export default function KrCreate() {
  const router = useRouter();
  const { getAvailableProviders, getAdapter, requestPayment, isLoading, error, result } = usePayment();

  const [businessType, setBusinessType] = useState<BusinessType>("NONE");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentProviderType>("TOSS");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const availableProviders = getAvailableProviders({
    country: "KR",
    businessType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Zod 스키마 검증
    const formData =
      businessType === "NONE"
        ? { businessType, paymentMethod, customerName, customerEmail, amount }
        : {
            businessType,
            paymentMethod,
            customerName,
            customerEmail,
            amount,
            registrationNumber,
          };

    const parsed = KrPurchaseSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    const adapter = getAdapter(paymentMethod);
    const checkoutUrl = adapter.getCheckoutUrl({
      amount,
      currency: "KRW",
      orderName: "테스트 상품",
      customerName,
      customerEmail,
    });

    // checkout URL이 있으면 (Toss) 해당 페이지로 라우팅
    if (checkoutUrl !== null) {
      router.push(checkoutUrl);
      return;
    }

    // checkout URL이 null이면 (무통장입금 등) Adapter로 직접 처리
    await requestPayment(
      { country: "KR", businessType },
      paymentMethod,
      {
        orderId: `order_${Date.now()}`,
        amount,
        currency: "KRW",
        customerName,
        customerEmail,
      },
    );
  };

  const submitLabel = isLoading
    ? "처리중..."
    : paymentMethod === "TOSS"
      ? "Toss 결제하기"
      : "결제하기";

  return (
    <PaymentFormLayout
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      isLoading={isLoading}
    >
      <h2 className="text-xl font-bold">한국 결제</h2>

      {/* 사업자 유형 선택 */}
      <div>
        <label className="block text-sm font-medium mb-1">사업자 유형</label>
        <select
          value={businessType}
          onChange={(e) => {
            const newType = e.target.value as BusinessType;
            setBusinessType(newType);
            setPaymentMethod("TOSS");
          }}
          className="w-full border rounded p-2"
        >
          <option value="NONE">일반 개인</option>
          <option value="INDIVIDUAL">개인사업자</option>
          <option value="CORPORATE">법인사업자</option>
        </select>
      </div>

      {/* 결제 수단 선택 - Factory 기반 */}
      <div>
        <label className="block text-sm font-medium mb-1">결제 수단</label>
        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value as PaymentProviderType)
          }
          className="w-full border rounded p-2"
        >
          {availableProviders.map((provider) => (
            <option key={provider} value={provider}>
              {PROVIDER_LABELS[provider] || provider}
            </option>
          ))}
        </select>
      </div>

      {/* 공통 입력 필드 */}
      <PaymentFormFields
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerEmail={customerEmail}
        onCustomerEmailChange={setCustomerEmail}
        amount={amount}
        onAmountChange={setAmount}
        nameLabel="이름"
        emailLabel="이메일"
        amountLabel="결제 금액 (원)"
        namePlaceholder="홍길동"
        amountPlaceholder="10000"
      />

      {/* 사업자 전용 필드 */}
      {businessType !== "NONE" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            사업자등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="000-00-00000"
          />
        </div>
      )}

      <ValidationErrors errors={validationErrors} />
      <PaymentError error={error} />

      {/* 결제 결과 (무통장입금 등) */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-green-700 text-sm font-medium">{result.message}</p>
          <p className="text-green-600 text-xs mt-1">
            TX: {result.transactionId}
          </p>
        </div>
      )}
    </PaymentFormLayout>
  );
}
