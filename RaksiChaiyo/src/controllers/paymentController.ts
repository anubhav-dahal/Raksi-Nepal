import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createEsewaSession } from '../models/api/payments';
import { useAuthStore } from '../models/stores/authStore';

export type PaymentOutcome = 'success' | 'failed' | 'cancelled' | 'pending' | 'dismissed';

/**
 * Opens eSewa in an in-app browser and waits until eSewa sends the user back.
 * The result only says what happened in the browser; the order screen then
 * reloads the order from the server, which is the real source of truth.
 */
export const payWithEsewa = async (orderId: string): Promise<PaymentOutcome> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not logged in');

  // exp://... in Expo Go, raksichaiyo://... in a real build.
  const returnUrl = Linking.createURL('/payment-result');
  const { url } = await createEsewaSession(token, orderId, returnUrl);

  const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);
  if (result.type !== 'success') return 'dismissed';

  const outcome = Linking.parse(result.url).queryParams?.result;
  return outcome === 'success' || outcome === 'failed' || outcome === 'cancelled' || outcome === 'pending'
    ? outcome
    : 'failed';
};
