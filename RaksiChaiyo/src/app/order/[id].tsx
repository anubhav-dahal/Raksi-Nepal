import { useLocalSearchParams } from 'expo-router';
import { OrderScreen } from '../../views/screens/OrderScreen';

export default function OrderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderScreen id={id} />;
}
