"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useBusinessType } from "@/lib/hooks/useBusinessType";
import type { BusinessType, CountryCode } from "@/lib/payment/types";
import { I18nProvider } from "@/lib/i18n";

function SettingsContent() {
  const router = useRouter();
  const { businessType, setBusinessType } = useBusinessType();
  const t = useTranslations("settings");

  const OPTIONS: { value: BusinessType; label: string; description: string }[] = [
    { value: "NONE", label: t("none"), description: t("noneDesc") },
    { value: "INDIVIDUAL", label: t("individual"), description: t("individualDesc") },
    { value: "CORPORATE", label: t("corporate"), description: t("corporateDesc") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-900 mr-4"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">{t("title")}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-4">{t("businessType")}</h2>
          <div className="space-y-3">
            {OPTIONS.map(({ value, label, description }) => (
              <label
                key={value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  businessType === value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="businessType"
                  value={value}
                  checked={businessType === value}
                  onChange={() => setBusinessType(value)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsInner() {
  const searchParams = useSearchParams();
  const country = (searchParams.get("country") as CountryCode) || "KR";

  return (
    <I18nProvider country={country}>
      <SettingsContent />
    </I18nProvider>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsInner />
    </Suspense>
  );
}
