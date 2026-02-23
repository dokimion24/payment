"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface PaymentFormFieldsProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerEmail: string;
  onCustomerEmailChange: (value: string) => void;
  amount: number;
  onAmountChange: (value: number) => void;
  /** 필드 라벨 — 국가별 다르게 전달 */
  nameLabel?: string;
  emailLabel?: string;
  amountLabel?: string;
  /** 필드 placeholder — 국가별 다르게 전달 */
  namePlaceholder?: string;
  emailPlaceholder?: string;
  amountPlaceholder?: string;
}

/** 이름 + 이메일 + 금액 공통 필드 */
export function PaymentFormFields({
  customerName,
  onCustomerNameChange,
  customerEmail,
  onCustomerEmailChange,
  amount,
  onAmountChange,
  nameLabel = "Name",
  emailLabel = "Email",
  amountLabel = "Amount",
  namePlaceholder = "John Doe",
  emailPlaceholder = "email@example.com",
  amountPlaceholder = "100",
}: PaymentFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">{nameLabel}</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full border rounded p-2"
          placeholder={namePlaceholder}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{emailLabel}</label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => onCustomerEmailChange(e.target.value)}
          className="w-full border rounded p-2"
          placeholder={emailPlaceholder}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{amountLabel}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(Number(e.target.value))}
          className="w-full border rounded p-2"
          placeholder={amountPlaceholder}
        />
      </div>
    </>
  );
}

interface ValidationErrorsProps {
  errors: string[];
}

/** 검증 에러 표시 영역 */
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

interface PaymentErrorProps {
  error: string | null;
}

/** 결제 처리 에러 표시 */
export function PaymentError({ error }: PaymentErrorProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded p-3">
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  );
}

interface PaymentFormLayoutProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitLabel: string;
  isLoading?: boolean;
  disabled?: boolean;
  buttonClassName?: string;
}

/** 폼 레이아웃 + 제출 버튼 */
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
