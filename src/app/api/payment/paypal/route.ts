import { NextResponse } from "next/server";

import { PayPalVerifyBodySchema } from "@/lib/payment/schemas";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

/** PayPal OAuth2 토큰 발급 */
async function getPayPalAccessToken(): Promise<string | null> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) return null;

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.access_token;
}

/** PayPal Order ID로 서버사이드 검증 */
async function verifyPayPalOrder(orderId: string, accessToken: string) {
  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) return null;
  return response.json();
}

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = PayPalVerifyBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const { orderId, status, amount, currency } = parsed.data;

  // 서버사이드 검증: PayPal API로 주문 재확인
  const accessToken = await getPayPalAccessToken();

  if (accessToken) {
    const orderDetails = await verifyPayPalOrder(orderId, accessToken);

    if (!orderDetails || orderDetails.status !== "COMPLETED") {
      return NextResponse.json(
        { message: "PayPal order verification failed." },
        { status: 400 },
      );
    }

    // 금액 검증: 클라이언트가 보낸 금액과 PayPal이 확인한 금액 비교
    const purchaseUnit = orderDetails.purchase_units?.[0];
    if (purchaseUnit) {
      const verifiedAmount = purchaseUnit.amount?.value;
      const verifiedCurrency = purchaseUnit.amount?.currency_code;

      if (verifiedAmount !== amount || verifiedCurrency !== currency) {
        return NextResponse.json(
          { message: "Amount or currency mismatch." },
          { status: 400 },
        );
      }
    }
  }

  // TODO: DB에 결제 내역 저장
  // await db.payment.create({ data: { orderId, status, amount, currency, payer: body.payer } });

  // TODO: 주문 상태 업데이트
  // await db.order.update({ where: { id: relatedOrderId }, data: { status: 'PAID' } });

  return NextResponse.json({
    success: true,
    orderId: body.orderId,
    status: body.status,
  });
}
