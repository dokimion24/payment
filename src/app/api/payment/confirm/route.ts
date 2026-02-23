import { NextResponse } from "next/server";

import { TossConfirmBodySchema } from "@/lib/payment/schemas";

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

  // ────────────────────────────────────────────────────────
  // 금액 검증 가이드
  // ────────────────────────────────────────────────────────
  // 클라이언트가 보낸 amount를 그대로 승인하면 금액 변조 공격에 취약합니다.
  // 반드시 서버에 저장된 주문 금액과 대조해야 합니다.
  //
  // 구현 예시:
  //   const order = await db.order.findUnique({ where: { id: orderId } });
  //   if (!order) return NextResponse.json({ message: "주문을 찾을 수 없습니다." }, { status: 404 });
  //   if (order.amount !== amount) return NextResponse.json({ message: "금액 불일치" }, { status: 400 });
  //
  // 추가 고려사항:
  // - 이미 승인된 주문인지 중복 검사 (idempotency)
  // - 주문 상태가 '결제 대기' 인지 확인
  // - race condition 방지를 위한 DB 트랜잭션 사용
  // ────────────────────────────────────────────────────────

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

    // 승인 성공 — 필요한 정보만 클라이언트에 반환
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
