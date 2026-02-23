import { nanoid } from 'nanoid';

export interface Order {
  orderId: string;
  amount: number;
  currency: string;
  orderName: string;
  customerName: string;
  customerEmail: string;
  businessType: 'NONE' | 'INDIVIDUAL' | 'CORPORATE';
  registrationNumber?: string;
  country: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

const orders = new Map<string, Order>();

export function createOrder(
  data: Omit<Order, 'orderId' | 'status' | 'createdAt'>,
): Order {
  const orderId = `order_${nanoid()}`;
  const order: Order = {
    ...data,
    orderId,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  orders.set(orderId, order);
  return order;
}

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}

export function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Order | undefined {
  const order = orders.get(orderId);
  if (!order) return undefined;
  order.status = status;
  return order;
}
