"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  CustomerFields,
  OrderSummary,
  PaymentFormLayout,
  ValidationErrors,
} from "../components/PaymentForm";
import { GlobalPurchaseSchema } from "../schemas";
import { useCreateOrder } from "../hooks/useCreateOrder";

export default function GlobalCreate() {
  const searchParams = useSearchParams();
  const t = useTranslations();

  const amount = Number(searchParams.get("amount")) || 0;
  const orderName = searchParams.get("orderName") || "";
  const currency = (searchParams.get("currency") as "USD" | "EUR") || "USD";
  const country = searchParams.get("country") || "US";

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { submit, isSubmitting, error: submitError } = useCreateOrder({
    provider: "PAYPAL",
    fallbackError: t("paymentCreateGlobal.orderCreateError"),
  });

  const currencySymbol = currency === "USD" ? "$" : "\u20AC";

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors([]);

    const parsed = GlobalPurchaseSchema.safeParse({
      paymentMethod: "PAYPAL" as const,
      customerName,
      customerEmail,
      amount,
      currency,
    });
    if (!parsed.success) {
      setValidationErrors(parsed.error.issues.map((issue) => t(issue.message)));
      return;
    }

    await submit({
      amount,
      currency,
      orderName,
      customerName,
      customerEmail,
      country,
      businessType: "NONE",
    });
  };

  return (
    <PaymentFormLayout
      onSubmit={handleSubmit}
      submitLabel={t("paymentCreateGlobal.submitLabel")}
      isLoading={isSubmitting}
      buttonClassName="w-full bg-yellow-400 text-black font-medium rounded p-2 hover:bg-yellow-500"
    >
      <h2 className="text-xl font-bold">{t("paymentCreateGlobal.title")}</h2>

      <OrderSummary
        rows={[
          { label: t("paymentCreateGlobal.product"), value: orderName },
          { label: t("paymentCreateGlobal.amount"), value: `${currencySymbol}${amount.toFixed(2)}`, bold: true },
          { label: t("paymentCreateGlobal.currency"), value: currency },
        ]}
      />

      <CustomerFields
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerEmail={customerEmail}
        onCustomerEmailChange={setCustomerEmail}
      />

      <ValidationErrors errors={submitError ? [...validationErrors, submitError] : validationErrors} />
    </PaymentFormLayout>
  );
}
