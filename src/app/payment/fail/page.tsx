"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { I18nProvider } from "@/lib/i18n";

function FailContent() {
  const searchParams = useSearchParams();
  const t = useTranslations();

  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">✕</div>
        <h1 className="text-xl font-bold mb-2">{t("paymentFail.title")}</h1>
        <p className="text-gray-500 mb-6">{t("paymentFail.description")}</p>

        <div className="bg-red-50 rounded-lg p-4 text-left space-y-2 text-sm mb-6">
          {code && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t("paymentFail.errorCode")}</span>
              <span className="font-mono text-red-600">{code}</span>
            </div>
          )}
          {message && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t("paymentFail.errorMessage")}</span>
              <span className="text-red-600">{message}</span>
            </div>
          )}
          {orderId && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t("paymentFail.orderId")}</span>
              <span className="font-mono">{orderId}</span>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
        >
          {t("common.backToHome")}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense>
      <I18nProvider country="KR">
        <FailContent />
      </I18nProvider>
    </Suspense>
  );
}
