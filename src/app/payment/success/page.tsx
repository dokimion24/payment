"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { I18nProvider } from "@/lib/i18n";

interface PaymentConfirmResult {
  success: boolean;
  data?: {
    orderId: string;
    totalAmount: number;
    method: string;
    status: string;
    approvedAt: string;
  };
  error?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [result, setResult] = useState<PaymentConfirmResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  // 서버에 결제 승인 요청
  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setResult({ success: false, error: t("paymentSuccess.missingParams") });
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setResult({ success: true, data });
        } else {
          setResult({ success: false, error: data.message || t("paymentSuccess.confirmFailed") });
        }
      } catch {
        setResult({ success: false, error: t("paymentSuccess.serverError") });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [paymentKey, orderId, amount, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">{t("paymentSuccess.confirmingPayment")}</p>
        </div>
      </div>
    );
  }

  if (!result?.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <h1 className="text-xl font-bold mb-2">{t("paymentSuccess.failTitle")}</h1>
          <p className="text-gray-500 mb-6">{result?.error}</p>
          <Link
            href="/"
            className="inline-block bg-gray-100 text-gray-700 rounded-lg px-6 py-2 hover:bg-gray-200"
          >
            {t("common.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-xl font-bold mb-2">{t("paymentSuccess.successTitle")}</h1>
        <p className="text-gray-500 mb-6">{t("paymentSuccess.successDescription")}</p>

        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">{t("paymentSuccess.orderId")}</span>
            <span className="font-mono">{result.data?.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("paymentSuccess.paymentAmount")}</span>
            <span className="font-bold">
              {result.data?.totalAmount?.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("paymentSuccess.paymentMethod")}</span>
            <span>{result.data?.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("paymentSuccess.status")}</span>
            <span className="text-green-600 font-medium">{result.data?.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("paymentSuccess.approvedAt")}</span>
            <span>{result.data?.approvedAt}</span>
          </div>
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

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <I18nProvider country="KR">
        <SuccessContent />
      </I18nProvider>
    </Suspense>
  );
}
