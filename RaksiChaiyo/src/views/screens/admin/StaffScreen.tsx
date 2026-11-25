import { ScrollView, Text, View } from 'react-native';
import { useStaffRoles } from '../../../controllers/staffControllers';
import { useT, type StringKey } from '../../../i18n';
import type { Role } from '../../../models/types';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Eyebrow, Screen } from '../../components/Layout';

const ROLES: Role[] = ['rider', 'admin', 'customer'];

export function StaffScreen() {
  const t = useT();
  const c = useStaffRoles();

  return (
    <Screen>
      <AppHeader title={t('admin.staffTitle')} showCart={false} />
      <ScrollView contentContainerClassName="gap-4 px-gutter pb-10 pt-2" keyboardShouldPersistTaps="handled">
        <Text className="font-body text-body text-muted">{t('admin.staffHint')}</Text>
        <Input label={t('auth.phone')} type="phone" placeholder="98XXXXXXXX" value={c.phone} onChangeText={c.setPhone} />
        <Text className="font-body-bold text-caption text-muted">{t('admin.role')}</Text>
        <View className="flex-row gap-2">
          {ROLES.map((r) => (
            <Chip key={r} label={t(`admin.role.${r}` as StringKey)} selected={c.role === r} onPress={() => c.setRole(r)} />
          ))}
        </View>
        <Button label={t('admin.saveRole')} loading={c.busy === 'role'} disabled={!c.canSubmit} onPress={c.submit} />

        <View className="mt-2 gap-2">
          <Eyebrow>{t('admin.riders')}</Eyebrow>
          {(c.riders.data ?? []).map((r) => (
            <View key={r.id} className="flex-row justify-between rounded-md border border-border bg-card p-3">
              <Text className="font-body-semibold text-body text-text">{r.name}</Text>
              <Text className="font-body text-label text-muted">
                {r.phone} · {t('admin.riderBusy', { count: r.activeOrders })}
              </Text>
            </View>
          ))}
          {c.riders.data?.length === 0 && <Text className="font-body text-label text-muted">{t('admin.noRiders')}</Text>}
        </View>
      </ScrollView>
    </Screen>
  );
}
