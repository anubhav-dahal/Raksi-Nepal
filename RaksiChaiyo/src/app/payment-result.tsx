import { Redirect, useLocalSearchParams } from 'expo-router';

// eSewa sends the browser back to this link. Usually the in-app browser
// catches it first; if the phone opens it as a deep link instead, go to the order.
export default function PaymentResultRoute() {
  const { orderId, result } = useLocalSearchParams<{ orderId?: string; result?: string }>();
  if (!orderId) return <Redirect href="/" />;
  return <Redirect href={{ pathname: '/order/[id]', params: { id: orderId, payment: result ?? 'failed' } }} />;
}
