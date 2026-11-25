import { useLocalSearchParams } from 'expo-router';
import type { PaymentOutcome } from '../../controllers/paymentController';
import { OrderScreen } from '../../views/screens/OrderScreen';

export default function OrderRoute() {
  const { id, placed, payment } = useLocalSearchParams<{ id: string; placed?: string; payment?: PaymentOutcome }>();
  return <OrderScreen id={id} placed={placed === '1'} payment={payment} />;
}
