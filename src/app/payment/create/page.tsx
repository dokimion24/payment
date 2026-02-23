"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { getPaymentStrategy } from "@/lib/payment/strategies";
import type { CountryCode } from "@/lib/payment/types";
import { I18nProvider } from "@/lib/i18n";

function LoadingFallback() {
  const t = useTranslations("common");
  return (
    <div className="text-center py-12 text-gray-400">{t("loading")}</div>
  );
}

function PaymentCreateContent() {
  const searchParams = useSearchParams();
  const country = (searchParams.get("country") as CountryCode) || "KR";

  const StrategyComponent = getPaymentStrategy(country);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          <StrategyComponent />
        </Suspense>
      </div>
    </div>
  );
}

function PaymentCreateInner() {
  const searchParams = useSearchParams();
  const country = (searchParams.get("country") as CountryCode) || "KR";

  return (
    <I18nProvider country={country}>
      <PaymentCreateContent />
    </I18nProvider>
  );
}

export default function PaymentCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
          로딩 중...
        </div>
      }
    >
      <PaymentCreateInner />
    </Suspense>
  );
}
