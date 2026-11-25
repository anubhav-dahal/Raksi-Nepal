import { useLocalSearchParams } from 'expo-router';
import { AdminProductScreen } from '../../../views/screens/admin/AdminProductScreen';

export default function AdminProductRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminProductScreen id={id} />;
}
