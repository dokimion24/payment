"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PaymentFactory } from "@/lib/payment/factory";
import type { CountryCode } from "@/lib/payment/types";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/hooks/useCart";

const COUNTRY_OPTIONS: { code: CountryCode; label: string; flag: string }[] = [
  { code: "KR", label: "한국", flag: "🇰🇷" },
  { code: "US", label: "US", flag: "🇺🇸" },
  { code: "FR", label: "FR", flag: "🇫🇷" },
];

export default function Home() {
  const router = useRouter();
  const [country, setCountry] = useState<CountryCode>("KR");
  const {
    cartItems,
    cartCount,
    totalAmount,
    currency,
    addToCart,
    removeFromCart,
    getQty,
    formatPrice,
    formatTotal,
  } = useCart(country);

  const isKr = country === "KR";

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const orderName =
      cartItems.length === 1
        ? isKr
          ? cartItems[0].name
          : cartItems[0].nameEn
        : isKr
          ? `${cartItems[0].name} 외 ${cartItems.length - 1}건`
          : `${cartItems[0].nameEn} and ${cartItems.length - 1} more`;

    const providers = PaymentFactory.getAvailableProviders({
      country,
      businessType: "NONE",
    });
    const adapter = PaymentFactory.getAdapter(providers[0]);
    const checkoutUrl = adapter.getCheckoutUrl({
      amount: totalAmount,
      currency,
      orderName,
    });

    if (checkoutUrl) {
      router.push(checkoutUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">SHOP</h1>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {COUNTRY_OPTIONS.map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => setCountry(code)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    country === code
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {flag} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {PRODUCTS.map((product) => {
            const inCart = getQty(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border overflow-hidden group"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={isKr ? product.name : product.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.tag && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {isKr ? product.name : product.nameEn}
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {formatPrice(product)}
                  </p>
                  <div className="mt-3">
                    {inCart === 0 ? (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-full bg-gray-900 text-white text-xs font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        {isKr ? "담기" : "Add to Cart"}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-100 rounded-lg">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium">{inCart}</span>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 장바구니 바 */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {cartCount}
                {isKr ? "개 상품" : ` item${cartCount > 1 ? "s" : ""}`}
              </p>
              <p className="text-lg font-bold">{formatTotal()}</p>
            </div>
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {isKr ? "주문하기" : "Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
