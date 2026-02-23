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
import { KrPurchaseSchema } from "../schemas";
import { useBusinessType } from "../../hooks/useBusinessType";
import { useCreateOrder } from "../hooks/useCreateOrder";

export default function KrCreate() {
  const searchParams = useSearchParams();
  const { businessType } = useBusinessType();
  const t = useTranslations();

  const amount = Number(searchParams.get("amount")) || 0;
  const orderName = searchParams.get("orderName") || "";

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { submit, isSubmitting, error: submitError } = useCreateOrder({
    provider: "TOSS",
    fallbackError: t("paymentCreate.orderCreateError"),
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors([]);

    const formData =
      businessType === "NONE"
        ? { businessType, customerName, customerEmail, amount }
        : { businessType, customerName, customerEmail, amount, registrationNumber };

    const parsed = KrPurchaseSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationErrors(parsed.error.issues.map((issue) => t(issue.message)));
      return;
    }

    await submit({
      amount,
      currency: "KRW",
      orderName,
      customerName,
      customerEmail,
      country: "KR",
      businessType,
      ...(businessType !== "NONE" && { registrationNumber }),
    });
  };

  const isBusiness = businessType !== "NONE";
  const allErrors = submitError ? [...validationErrors, submitError] : validationErrors;

  return (
    <PaymentFormLayout
      onSubmit={handleSubmit}
      submitLabel={t("paymentCreate.submitLabel")}
      isLoading={isSubmitting}
    >
      <h2 className="text-xl font-bold">{t("paymentCreate.title")}</h2>

      <OrderSummary
        rows={[
          { label: t("paymentCreate.product"), value: orderName },
          { label: t("paymentCreate.amount"), value: `${amount.toLocaleString()}원`, bold: true },
        ]}
      />

      <CustomerFields
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerEmail={customerEmail}
        onCustomerEmailChange={setCustomerEmail}
      />

      {isBusiness && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("paymentCreate.registrationNumber")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className="w-full border rounded p-2"
            placeholder={t("paymentCreate.registrationPlaceholder")}
          />
          <p className="text-xs text-gray-400 mt-1">
            {t("paymentCreate.businessTypeLabel", {
              type: businessType === "INDIVIDUAL"
                ? t("paymentCreate.businessTypeIndividual")
                : t("paymentCreate.businessTypeCorporate"),
            })}
          </p>
        </div>
      )}

      <ValidationErrors errors={allErrors} />
    </PaymentFormLayout>
  );
}
