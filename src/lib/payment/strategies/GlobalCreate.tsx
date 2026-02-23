"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  PaymentFormFields,
  PaymentFormLayout,
  ValidationErrors,
} from "../components/PaymentForm";
import { PaymentFactory } from "../factory";
import { GlobalPurchaseSchema } from "../schemas";

export default function GlobalCreate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const amount = Number(searchParams.get("amount")) || 0;
  const orderName = searchParams.get("orderName") || "";
  const currency = (searchParams.get("currency") as "USD" | "EUR") || "USD";

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currencySymbol = currency === "USD" ? "$" : "\u20AC";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      setValidationErrors(parsed.error.issues.map((issue) => t(issue.message)));
      return;
    }

    setIsSubmitting(true);
    try {
      const country = searchParams.get("country") || "US";

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          orderName,
          customerName,
          customerEmail,
          country,
          businessType: "NONE",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setValidationErrors([err.message || t("paymentCreateGlobal.orderCreateFailed")]);
        return;
      }

      const { orderId } = await res.json();

      const adapter = PaymentFactory.getAdapter("PAYPAL");
      const checkoutUrl = adapter.getCheckoutUrl({
        orderId,
        amount,
        currency,
        orderName,
        customerName,
      });

      if (checkoutUrl) {
        router.push(checkoutUrl);
      }
    } catch {
      setValidationErrors([t("paymentCreateGlobal.orderCreateError")]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PaymentFormLayout
      onSubmit={handleSubmit}
      submitLabel={t("paymentCreateGlobal.submitLabel")}
      isLoading={isSubmitting}
      buttonClassName="w-full bg-yellow-400 text-black font-medium rounded p-2 hover:bg-yellow-500"
    >
      <h2 className="text-xl font-bold">{t("paymentCreateGlobal.title")}</h2>

      {/* 주문 요약 */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">{t("paymentCreateGlobal.product")}</span>
          <span>{orderName}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500">{t("paymentCreateGlobal.amount")}</span>
          <span className="font-bold">{currencySymbol}{amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500">{t("paymentCreateGlobal.currency")}</span>
          <span>{currency}</span>
        </div>
      </div>

      {/* 고객 정보 입력 */}
      <PaymentFormFields
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerEmail={customerEmail}
        onCustomerEmailChange={setCustomerEmail}
        amount={amount}
        onAmountChange={() => {}}
      />

      <ValidationErrors errors={validationErrors} />
    </PaymentFormLayout>
  );
}
