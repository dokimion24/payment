"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface CustomerFieldsProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerEmail: string;
  onCustomerEmailChange: (value: string) => void;
}

export function CustomerFields({
  customerName,
  onCustomerNameChange,
  customerEmail,
  onCustomerEmailChange,
}: CustomerFieldsProps) {
  const t = useTranslations("paymentCreate");

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">{t("nameLabel")}</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full border rounded p-2"
          placeholder={t("namePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t("emailLabel")}</label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => onCustomerEmailChange(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="email@example.com"
        />
      </div>
    </>
  );
}

interface OrderSummaryProps {
  rows: { label: string; value: string; bold?: boolean }[];
}

export function OrderSummary({ rows }: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm">
      {rows.map(({ label, value, bold }, i) => (
        <div key={i} className={`flex justify-between${i > 0 ? " mt-1" : ""}`}>
          <span className="text-gray-500">{label}</span>
          <span className={bold ? "font-bold" : ""}>{value}</span>
        </div>
      ))}
    </div>
  );
}

interface ValidationErrorsProps {
  errors: string[];
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded p-3">
      {errors.map((err, i) => (
        <p key={i} className="text-red-600 text-sm">
          {err}
        </p>
      ))}
    </div>
  );
}

interface PaymentFormLayoutProps {
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitLabel: string;
  isLoading?: boolean;
  disabled?: boolean;
  buttonClassName?: string;
}

export function PaymentFormLayout({
  onSubmit,
  children,
  submitLabel,
  isLoading = false,
  disabled = false,
  buttonClassName = "w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50",
}: PaymentFormLayoutProps) {
  const t = useTranslations("common");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      <button
        type="submit"
        disabled={isLoading || disabled}
        className={buttonClassName}
      >
        {isLoading ? t("processing") : submitLabel}
      </button>
    </form>
  );
}
