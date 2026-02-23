"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  loadPaymentWidget,
  ANONYMOUS,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";

import { TossCheckoutParamsSchema } from "@/lib/payment/schemas";
import { ValidationErrorPage } from "@/lib/payment/components/ValidationErrorPage";
import { I18nProvider } from "@/lib/i18n";

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();

  // Zod로 쿼리 파라미터 검증
  const parsed = TossCheckoutParamsSchema.safeParse({
    orderId: searchParams.get("orderId"),
    amount: searchParams.get("amount"),
    orderName: searchParams.get("orderName"),
    customerName: searchParams.get("customerName"),
    customerEmail: searchParams.get("customerEmail"),
  });

  const data = parsed.success
    ? parsed.data
    : { orderId: "", amount: 0, orderName: "", customerName: "", customerEmail: "" };

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [status, setStatus] = useState<"init" | "ready" | "paying">("init");
  const [form, setForm] = useState({
    name: data.customerName,
    phone: "",
    email: data.customerEmail,
  });

  useEffect(() => {
    if (!parsed.success) return;

    (async () => {
      const paymentWidget = await loadPaymentWidget(clientKey, ANONYMOUS);
      paymentWidget.renderPaymentMethods("#payment-methods", data.amount);
      paymentWidget.renderAgreement("#agreement");
      paymentWidgetRef.current = paymentWidget;
      setStatus("ready");
    })();
  }, [data.amount, parsed.success]);

  if (!parsed.success) {
    return (
      <ValidationErrorPage
        title={t("checkout.invalidRequest")}
        description={t("checkout.invalidParams")}
        errors={parsed.error.issues}
        backLabel={t("common.backToHome")}
      />
    );
  }

  const handlePayment = async () => {
    const paymentWidget = paymentWidgetRef.current;
    if (!paymentWidget || !form.name.trim()) return;

    setStatus("paying");
    try {
      await paymentWidget.requestPayment({
        orderId: data.orderId,
        orderName: data.orderName,
        customerName: form.name,
        customerEmail: form.email || undefined,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch {
      setStatus("ready");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 mr-4"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">{t("checkout.title")}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32 space-y-4">
        {/* 주문 상품 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-3">{t("checkout.orderProduct")}</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{data.orderName}</span>
            <span className="text-sm font-bold">{data.amount.toLocaleString()}원</span>
          </div>
        </div>

        {/* 주문자 정보 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-4">{t("checkout.customerInfo")}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t("checkout.nameLabel")}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("checkout.namePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t("checkout.phoneLabel")}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("checkout.phonePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t("checkout.emailLabel")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("checkout.emailPlaceholder")}
              />
            </div>
          </div>
        </div>

        {/* 결제 수단 — 토스 위젯 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-4">{t("checkout.paymentMethod")}</h2>
          <div id="payment-methods" />
        </div>

        {/* 약관 */}
        <div className="bg-white rounded-xl border p-5">
          <div id="agreement" />
        </div>

        {/* 결제 금액 요약 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-3">{t("checkout.paymentAmount")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>{t("checkout.productAmount")}</span>
              <span>{data.amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>{t("checkout.shipping")}</span>
              <span className="text-blue-600">{t("checkout.shippingFree")}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-bold">{t("checkout.totalAmount")}</span>
              <span className="font-bold text-blue-600 text-lg">
                {data.amount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <button
            onClick={handlePayment}
            disabled={status !== "ready" || !form.name.trim()}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {status === "paying"
              ? t("common.processing")
              : t("checkout.payButton", { amount: data.amount.toLocaleString() })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <I18nProvider country="KR">
        <CheckoutContent />
      </I18nProvider>
    </Suspense>
  );
}
