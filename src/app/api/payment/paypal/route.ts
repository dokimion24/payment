import { NextResponse } from "next/server";

import { PayPalVerifyBodySchema } from "@/lib/payment/schemas";
import { getOrder, updateOrderStatus } from "@/lib/payment/orders/store";
import { PaymentFactory } from "@/lib/payment/factory";

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = PayPalVerifyBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const { orderId, amount, currency } = parsed.data;

  // 주문 조회
  const order = getOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { message: "Order not found." },
      { status: 404 },
    );
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { message: "Order already processed." },
      { status: 400 },
    );
  }

  try {
    const adapter = PaymentFactory.getAdapter("PAYPAL");
    const result = await adapter.requestPayment({
      orderId,
      amount: Number(amount) || order.amount,
      currency: currency || order.currency,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 },
      );
    }

    // 승인 성공 — 주문 상태 업데이트
    updateOrderStatus(orderId, "PAID");

    return NextResponse.json({
      success: true,
      orderId,
      status: "PAID",
    });
  } catch {
    return NextResponse.json(
      { message: "PayPal verification server error." },
      { status: 500 },
    );
  }
}
