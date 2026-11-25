import { Stack } from 'expo-router';
import { StaffGate } from '../../views/components/StaffGate';
import { useColors } from '../../views/theme';

// Every screen under /admin is for admins only (the API checks too).
export default function AdminLayout() {
  const colors = useColors();
  return (
    <StaffGate role="admin">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />
    </StaffGate>
  );
}
