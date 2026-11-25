import { useLocalSearchParams } from 'expo-router';
import { AdminNewProductScreen } from '../../../views/screens/admin/AdminNewProductScreen';

export default function AdminNewProductRoute() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  return <AdminNewProductScreen categoryId={categoryId} />;
}
