"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  loadPaymentWidget,
  ANONYMOUS,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";

import { TossCheckoutParamsSchema } from "@/lib/payment/schemas";
import { ValidationErrorPage } from "@/lib/payment/components/ValidationErrorPage";

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Zod로 쿼리 파라미터 검증
  const parsed = TossCheckoutParamsSchema.safeParse({
    amount: searchParams.get("amount"),
    orderName: searchParams.get("orderName"),
    customerName: searchParams.get("customerName"),
    customerEmail: searchParams.get("customerEmail"),
  });

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState(
    parsed.success ? parsed.data.customerName : "",
  );
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(
    parsed.success ? parsed.data.customerEmail : "",
  );

  const amount = parsed.success ? parsed.data.amount : 0;
  const orderName = parsed.success ? parsed.data.orderName : "";

  useEffect(() => {
    if (!parsed.success) return;

    (async () => {
      const paymentWidget = await loadPaymentWidget(clientKey, ANONYMOUS);
      paymentWidget.renderPaymentMethods("#payment-methods", amount);
      paymentWidget.renderAgreement("#agreement");
      paymentWidgetRef.current = paymentWidget;
      setIsReady(true);
    })();
  }, [amount, parsed.success]);

  if (!parsed.success) {
    return (
      <ValidationErrorPage
        title="잘못된 결제 요청"
        description="결제 파라미터가 올바르지 않습니다."
        errors={parsed.error.issues}
        backLabel="홈으로 돌아가기"
      />
    );
  }

  const handlePayment = async () => {
    const paymentWidget = paymentWidgetRef.current;
    if (!paymentWidget || !customerName.trim()) return;

    setIsLoading(true);
    try {
      await paymentWidget.requestPayment({
        orderId: nanoid(),
        orderName,
        customerName,
        customerEmail: customerEmail || undefined,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch {
      setIsLoading(false);
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
          <h1 className="text-lg font-bold">주문/결제</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32 space-y-4">
        {/* 주문 상품 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-3">주문 상품</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{orderName}</span>
            <span className="text-sm font-bold">{amount.toLocaleString()}원</span>
          </div>
        </div>

        {/* 주문자 정보 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-4">주문자 정보</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">이름</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="주문자 이름"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">연락처</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="010-0000-0000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">이메일</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* 결제 수단 — 토스 위젯 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-4">결제 수단</h2>
          <div id="payment-methods" />
        </div>

        {/* 약관 */}
        <div className="bg-white rounded-xl border p-5">
          <div id="agreement" />
        </div>

        {/* 결제 금액 요약 */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-bold text-sm mb-3">결제 금액</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>상품 금액</span>
              <span>{amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>배송비</span>
              <span className="text-blue-600">무료</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-bold">총 결제 금액</span>
              <span className="font-bold text-blue-600 text-lg">
                {amount.toLocaleString()}원
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
            disabled={!isReady || isLoading || !customerName.trim()}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading
              ? "처리 중..."
              : `${amount.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
