import { useLocalSearchParams } from 'expo-router';
import { AdminCategoryScreen } from '../../../views/screens/admin/AdminCategoryScreen';

export default function AdminCategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminCategoryScreen id={id} />;
}
