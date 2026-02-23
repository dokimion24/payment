"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PaymentConfirmResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  // 서버에 결제 승인 요청
  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setResult({ success: false, error: "필수 파라미터가 누락되었습니다." });
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
          setResult({ success: false, error: data.message || "결제 승인에 실패했습니다." });
        }
      } catch {
        setResult({ success: false, error: "서버 통신 중 오류가 발생했습니다." });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [paymentKey, orderId, amount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">결제 승인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (!result?.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <h1 className="text-xl font-bold mb-2">결제 승인 실패</h1>
          <p className="text-gray-500 mb-6">{result?.error}</p>
          <Link
            href="/"
            className="inline-block bg-gray-100 text-gray-700 rounded-lg px-6 py-2 hover:bg-gray-200"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-xl font-bold mb-2">결제 완료</h1>
        <p className="text-gray-500 mb-6">결제가 성공적으로 처리되었습니다.</p>

        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">주문번호</span>
            <span className="font-mono">{result.data?.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">결제 금액</span>
            <span className="font-bold">
              {result.data?.totalAmount?.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">결제 수단</span>
            <span>{result.data?.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">상태</span>
            <span className="text-green-600 font-medium">{result.data?.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">승인 시각</span>
            <span>{result.data?.approvedAt}</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
