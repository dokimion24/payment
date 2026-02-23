"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { getPaymentStrategy } from "@/lib/payment/strategies";
import type { CountryCode } from "@/lib/payment/types";
import { I18nProvider } from "@/lib/i18n";

function PaymentCreateContent() {
  const searchParams = useSearchParams();
  const country = (searchParams.get("country") as CountryCode) || "KR";
  const StrategyComponent = getPaymentStrategy(country);

  return (
    <I18nProvider country={country}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <StrategyComponent />
        </div>
      </div>
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
      <PaymentCreateContent />
    </Suspense>
  );
}
