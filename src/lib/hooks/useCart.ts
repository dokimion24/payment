'use client';

import { useState } from 'react';

import { PRODUCTS, type Product } from '../products';
import type { CountryCode } from '../payment/types';

export interface CartItem extends Product {
  qty: number;
}

export function useCart(country: CountryCode) {
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  const isKr = country === 'KR';

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(productId, (next.get(productId) || 0) + 1);
      return next;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const qty = next.get(productId) || 0;
      if (qty <= 1) next.delete(productId);
      else next.set(productId, qty - 1);
      return next;
    });
  };

  const getQty = (productId: string) => cart.get(productId) || 0;

  const cartItems: CartItem[] = PRODUCTS
    .filter((p) => cart.has(p.id))
    .map((p) => ({ ...p, qty: cart.get(p.id) || 0 }));

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (isKr ? item.price : item.priceUsd) * item.qty,
    0,
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const currency = isKr ? 'KRW' : 'USD';

  const formatPrice = (product: Product) =>
    isKr
      ? `${product.price.toLocaleString()}원`
      : `$${product.priceUsd.toFixed(2)}`;

  const formatTotal = () =>
    isKr
      ? `${totalAmount.toLocaleString()}원`
      : `$${totalAmount.toFixed(2)}`;

  return {
    cart,
    cartItems,
    cartCount,
    totalAmount,
    currency,
    addToCart,
    removeFromCart,
    getQty,
    formatPrice,
    formatTotal,
  };
}
