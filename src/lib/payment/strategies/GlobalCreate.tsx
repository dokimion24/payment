"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  PaymentFormFields,
  PaymentFormLayout,
  ValidationErrors,
} from "../components/PaymentForm";
import { PaymentFactory } from "../factory";
import { GlobalPurchaseSchema } from "../schemas";

export default function GlobalCreate() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const formData = {
      paymentMethod: "PAYPAL" as const,
      customerName,
      customerEmail,
      amount,
      currency,
    };

    const parsed = GlobalPurchaseSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    // Adapter에서 checkout URL 생성
    const adapter = PaymentFactory.getAdapter("PAYPAL");
    const checkoutUrl = adapter.getCheckoutUrl({
      amount,
      currency,
      orderName: "Test Product",
      customerName,
    });

    if (checkoutUrl !== null) {
      router.push(checkoutUrl);
    }
  };

  return (
    <PaymentFormLayout
      onSubmit={handleSubmit}
      submitLabel="Pay with PayPal"
      buttonClassName="w-full bg-yellow-400 text-black font-medium rounded p-2 hover:bg-yellow-500"
    >
      <h2 className="text-xl font-bold">Global Payment (PayPal)</h2>

      {/* 공통 입력 필드 */}
      <PaymentFormFields
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerEmail={customerEmail}
        onCustomerEmailChange={setCustomerEmail}
        amount={amount}
        onAmountChange={setAmount}
      />

      {/* 통화 선택 — GlobalCreate 고유 필드 */}
      <div>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as "USD" | "EUR")}
          className="w-full border rounded p-2"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (&euro;)</option>
        </select>
      </div>

      <ValidationErrors errors={validationErrors} />
    </PaymentFormLayout>
  );
}
