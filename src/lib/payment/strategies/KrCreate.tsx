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
import { KrPurchaseSchema } from "../schemas";
import { useBusinessType } from "../../hooks/useBusinessType";

export default function KrCreate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { businessType } = useBusinessType();
  const t = useTranslations();

  const amount = Number(searchParams.get("amount")) || 0;
  const orderName = searchParams.get("orderName") || "";

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "KRW",
          orderName,
          customerName,
          customerEmail,
          country: "KR",
          businessType,
          ...(businessType !== "NONE" && { registrationNumber }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setValidationErrors([err.message || t("paymentCreate.orderCreateFailed")]);
        return;
      }

      const { orderId } = await res.json();

      const adapter = PaymentFactory.getAdapter("TOSS");
      const checkoutUrl = adapter.getCheckoutUrl({
        orderId,
        amount,
        currency: "KRW",
        orderName,
        customerName,
        customerEmail,
      });

      if (checkoutUrl) {
        router.push(checkoutUrl);
      }
    } catch {
      setValidationErrors([t("paymentCreate.orderCreateError")]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PaymentFormLayout
      onSubmit={handleSubmit}
      submitLabel={t("paymentCreate.submitLabel")}
      isLoading={isSubmitting}
    >
      <h2 className="text-xl font-bold">{t("paymentCreate.title")}</h2>

      {/* 주문 요약 */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">{t("paymentCreate.product")}</span>
          <span>{orderName}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500">{t("paymentCreate.amount")}</span>
          <span className="font-bold">{amount.toLocaleString()}원</span>
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
        nameLabel={t("paymentCreate.nameLabel")}
        emailLabel={t("paymentCreate.emailLabel")}
        amountLabel={t("paymentCreate.amountLabel")}
        namePlaceholder={t("paymentCreate.namePlaceholder")}
        amountPlaceholder={t("paymentCreate.amountPlaceholder")}
      />

      {/* 사업자 전용 필드 */}
      {businessType !== "NONE" && (
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

      <ValidationErrors errors={validationErrors} />
    </PaymentFormLayout>
  );
}
