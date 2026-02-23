import { NextResponse } from "next/server";

import { TossConfirmBodySchema } from "@/lib/payment/schemas";
import { getOrder, updateOrderStatus } from "@/lib/payment/orders/store";
import { PaymentFactory } from "@/lib/payment/factory";

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = TossConfirmBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const { paymentKey, orderId, amount } = parsed.data;

  // 주문 조회 및 금액 검증
  const order = getOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { message: "주문을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { message: "이미 처리된 주문입니다." },
      { status: 400 },
    );
  }
  if (order.amount !== amount) {
    return NextResponse.json(
      { message: "금액이 일치하지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const adapter = PaymentFactory.getAdapter("TOSS");
    const result = await adapter.requestPayment({
      paymentKey,
      orderId,
      amount,
      currency: "KRW",
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
      orderId,
      totalAmount: amount,
      status: "DONE",
      approvedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { message: "결제 승인 서버 오류" },
      { status: 500 },
    );
  }
}
