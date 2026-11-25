import { request } from './client';

/** Short-lived link that opens eSewa in the browser for this order. */
export const createEsewaSession = async (token: string, orderId: string, returnUrl: string) =>
  (
    await request<{ data: { url: string } }>(`/payments/esewa/${encodeURIComponent(orderId)}/session`, {
      method: 'POST',
      token,
      body: { returnUrl },
    })
  ).data;
