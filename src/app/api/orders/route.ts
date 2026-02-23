import { NextResponse } from 'next/server';

import { CreateOrderBodySchema } from '@/lib/payment/schemas';
import { createOrder } from '@/lib/payment/orders/store';

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = CreateOrderBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((i) => i.message).join(', ') },
      { status: 400 },
    );
  }

  const order = createOrder(parsed.data);

  return NextResponse.json(
    { orderId: order.orderId, status: order.status },
    { status: 201 },
  );
}
