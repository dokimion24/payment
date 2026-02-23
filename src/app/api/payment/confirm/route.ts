import { NextResponse } from "next/server";

import { TossConfirmBodySchema } from "@/lib/payment/schemas";
import { getOrder, updateOrderStatus } from "@/lib/payment/orders/store";

const secretKey = process.env.TOSS_SECRET_KEY!;

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
    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "결제 승인에 실패했습니다.", code: data.code },
        { status: response.status },
      );
    }

    // 승인 성공 — 주문 상태 업데이트
    updateOrderStatus(orderId, "PAID");

    return NextResponse.json({
      orderId: data.orderId,
      totalAmount: data.totalAmount,
      method: data.method,
      status: data.status,
      approvedAt: data.approvedAt,
    });
  } catch {
    return NextResponse.json(
      { message: "결제 승인 서버 오류" },
      { status: 500 },
    );
  }
}
