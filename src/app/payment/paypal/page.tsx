"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { PayPalCheckoutParamsSchema } from "@/lib/payment/schemas";
import { ValidationErrorPage } from "@/lib/payment/components/ValidationErrorPage";

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

export default function PayPalCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Zod로 쿼리 파라미터 검증
  const parsed = PayPalCheckoutParamsSchema.safeParse({
    amount: searchParams.get("amount"),
    currency: searchParams.get("currency"),
    orderName: searchParams.get("orderName"),
    customerName: searchParams.get("customerName"),
  });

  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [txId, setTxId] = useState("");
  const [customerName, setCustomerName] = useState(
    parsed.success ? parsed.data.customerName : "",
  );
  const [customerEmail, setCustomerEmail] = useState("");

  if (!parsed.success) {
    return (
      <ValidationErrorPage
        title="Invalid Payment Request"
        description="The payment parameters are invalid."
        errors={parsed.error.issues}
        backLabel="Back to Home"
      />
    );
  }

  const { amount, currency, orderName } = parsed.data;
  const amountStr = amount.toFixed(2);
  const currencySymbol = currency === "USD" ? "$" : "\u20AC";

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
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 결제 완료 */}
        {isPaid ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-1">Payment Successful</h2>
            <p className="text-gray-500 text-sm mb-4">Thank you for your purchase!</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-6 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction</span>
                <span className="font-mono text-xs">{txId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">{currencySymbol}{amountStr}</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-900 text-white rounded-xl px-8 py-3 font-medium hover:bg-gray-800"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* 주문 요약 */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-sm mb-3">Order Summary</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{orderName}</span>
                <span className="text-sm font-bold">{currencySymbol}{amountStr}</span>
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between">
                <span className="font-bold text-sm">Total</span>
                <span className="font-bold text-blue-600">{currencySymbol}{amountStr}</span>
              </div>
            </div>

            {/* 고객 정보 */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-sm mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
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

            {/* PayPal 결제 */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-sm mb-4">Payment</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <PayPalScriptProvider
                options={{ clientId, currency, intent: "capture" }}
              >
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "pay",
                    height: 48,
                  }}
                  createOrder={(_data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          description: orderName,
                          amount: { currency_code: currency, value: amountStr },
                        },
                      ],
                    });
                  }}
                  onApprove={async (_data, actions) => {
                    try {
                      const details = await actions.order?.capture();
                      if (details) {
                        setTxId(details.id || "");
                        setIsPaid(true);
                        await fetch("/api/payment/paypal", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderId: details.id,
                            status: details.status,
                            amount: amountStr,
                            currency,
                            payer: details.payer,
                          }),
                        });
                      }
                    } catch {
                      setError("Payment capture failed.");
                    }
                  }}
                  onError={() => setError("PayPal encountered an error.")}
                  onCancel={() => setError("Payment was cancelled.")}
                />
              </PayPalScriptProvider>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
