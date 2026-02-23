"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">✕</div>
        <h1 className="text-xl font-bold mb-2">결제 실패</h1>
        <p className="text-gray-500 mb-6">결제 처리 중 문제가 발생했습니다.</p>

        <div className="bg-red-50 rounded-lg p-4 text-left space-y-2 text-sm mb-6">
          {code && (
            <div className="flex justify-between">
              <span className="text-gray-500">에러 코드</span>
              <span className="font-mono text-red-600">{code}</span>
            </div>
          )}
          {message && (
            <div className="flex justify-between">
              <span className="text-gray-500">에러 메시지</span>
              <span className="text-red-600">{message}</span>
            </div>
          )}
          {orderId && (
            <div className="flex justify-between">
              <span className="text-gray-500">주문번호</span>
              <span className="font-mono">{orderId}</span>
            </div>
          )}
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
