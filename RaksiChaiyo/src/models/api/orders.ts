import { request } from './client';
import type { Address, Order, PaymentMethod, Quote } from '../types';

type ItemInput = { sku: string; quantity: number };

export const fetchQuote = async (items: ItemInput[]) =>
  (await request<{ data: Quote }>('/orders/quote', { method: 'POST', body: { items } })).data;

export const createOrder = async (
  token: string,
  idempotencyKey: string,
  input: { items: ItemInput[]; address: Address; paymentMethod: PaymentMethod; expectedTotal: number }
) =>
  (
    await request<{ data: Order }>('/orders', {
      method: 'POST',
      token,
      body: input,
      headers: { 'Idempotency-Key': idempotencyKey },
    })
  ).data;

export const fetchMyOrders = async (token: string) => (await request<{ data: Order[] }>('/orders', { token })).data;

export const fetchOrder = async (token: string, id: string) =>
  (await request<{ data: Order }>(`/orders/${encodeURIComponent(id)}`, { token })).data;
