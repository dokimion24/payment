"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import type { CountryCode } from "@/lib/payment/types";
import { PRODUCTS } from "@/lib/products";
import { I18nProvider, type Locale } from "@/lib/i18n";
import { useCart } from "@/lib/hooks/useCart";

const COUNTRY_OPTIONS: { code: CountryCode; label: string; flag: string }[] = [
  { code: "KR", label: "한국", flag: "🇰🇷" },
  { code: "US", label: "US", flag: "🇺🇸" },
  { code: "FR", label: "FR", flag: "🇫🇷" },
];

interface HomeContentProps {
  country: CountryCode;
  onCountryChange: (code: CountryCode) => void;
}

function HomeContent({ country, onCountryChange }: HomeContentProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as Locale;
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

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const orderName =
      cartItems.length === 1
        ? t("home.orderNameSingle", { name: cartItems[0].name[locale] })
        : t("home.orderNameMultiple", {
            name: cartItems[0].name[locale],
            rest: cartItems.length - 1,
          });

    const params = new URLSearchParams({
      country,
      amount: String(totalAmount),
      orderName,
      currency,
    });

    router.push(`/payment/create?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">SHOP</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/settings?country=${country}`)}
              className="text-gray-500 hover:text-gray-900 p-1"
              title={t("home.settings")}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <div className="flex gap-1">
              {COUNTRY_OPTIONS.map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => onCountryChange(code)}
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
                    alt={product.name[locale]}
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
                    {product.name[locale]}
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
                        {t("home.addToCart")}
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

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("home.cartItems", { count: cartCount })}
              </p>
              <p className="text-lg font-bold">{formatTotal()}</p>
            </div>
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {t("home.checkout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [country, setCountry] = useState<CountryCode>("KR");

  return (
    <I18nProvider country={country}>
      <HomeContent country={country} onCountryChange={setCountry} />
    </I18nProvider>
  );
}
