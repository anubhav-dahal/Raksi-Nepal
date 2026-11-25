import { useLocalSearchParams } from 'expo-router';
import { AdminOrderScreen } from '../../../views/screens/admin/AdminOrderScreen';

export default function AdminOrderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminOrderScreen id={id} />;
}
