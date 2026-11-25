import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useAdminDashboard } from '../../../controllers/staffControllers';
import { useT, type StringKey } from '../../../i18n';
import type { OrderFilter } from '../../../models/api/staff';
import type { StaffOrder } from '../../../models/types';
import { formatNpr } from '../../../utils/format';
import { router } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { IconButton } from '../../components/IconButton';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Eyebrow, Screen } from '../../components/Layout';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { EmptyState, ErrorState, Skeleton } from '../../components/StateView';
import { useColors } from '../../theme';

const FILTERS: OrderFilter[] = ['active', 'pending', 'out_for_delivery', 'all'];

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <View className="min-w-[46%] flex-1 gap-1 rounded-lg border border-border bg-card p-3.5">
      <Text className="font-body text-caption text-muted">{label}</Text>
      <Text className={`font-display text-title ${tone === 'warning' ? 'text-warning' : 'text-text'}`}>{value}</Text>
    </View>
  );
}

export function OrderCard({ order, onPress }: { order: StaffOrder; onPress: () => void }) {
  const unpaidEsewa = order.payment.method === 'esewa' && order.payment.status !== 'paid';
  return (
    <Pressable onPress={onPress} className="gap-1.5 rounded-lg border border-border bg-card p-3.5 active:opacity-80">
      <View className="flex-row items-center justify-between">
        <Text className="font-heading text-body text-text">{order.orderNumber}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
      <Text className="font-body-semibold text-label text-text">
        {order.user?.name ?? order.address.name} · {order.address.phone}
      </Text>
      <Text numberOfLines={1} className="font-body text-caption text-muted">
        {order.address.address}
      </Text>
      <Text className="font-body text-caption text-muted">
        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {order.items.length} item(s) ·{' '}
        {formatNpr(order.total)} · {order.payment.method.toUpperCase()}
        {unpaidEsewa ? ' (unpaid)' : ''}
        {order.rider ? ` · ${order.rider.name}` : ''}
      </Text>
    </Pressable>
  );
}

export function AdminDashboardScreen() {
  const t = useT();
  const colors = useColors();
  const c = useAdminDashboard();
  const s = c.summary.data;
  const activeCount = s ? Object.values(s.active).reduce((a, b) => a + (b ?? 0), 0) : 0;

  const header = (
    <View className="gap-3 pb-2">
      {s ? (
        <View className="flex-row flex-wrap gap-2.5">
          <Stat label={t('admin.today')} value={String(s.todayOrders)} />
          <Stat label={t('admin.revenue')} value={formatNpr(s.todayRevenue)} />
          <Stat label={t('admin.lowStock')} value={String(s.lowStockProducts)} tone={s.lowStockProducts ? 'warning' : undefined} />
          <Stat label={t('admin.awaitingPayment')} value={String(s.awaitingPayment)} />
        </View>
      ) : (
        <Skeleton className="h-36" />
      )}
      <View className="flex-row gap-2">
        <Button variant="secondary" label={t('admin.categories')} onPress={c.openCategories} className="flex-1 px-2" />
        <Button variant="secondary" label={t('admin.productsShort')} onPress={c.openProducts} className="flex-1 px-2" />
        <Button variant="secondary" label={t('admin.staff')} onPress={c.openStaff} className="flex-1 px-2" />
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Eyebrow>{`${t('admin.queue')} · ${activeCount}`}</Eyebrow>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} label={t(`admin.filter.${f}` as StringKey)} selected={c.filter === f} onPress={() => c.setFilter(f)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen>
      <AppHeader
        showCart={false}
        right={<IconButton icon="user" accessibilityLabel={t('account.title')} onPress={() => router.push('/account')} />}
      />
      {c.orders.error && !c.orders.data ? (
        <ErrorState error={c.orders.error} onRetry={c.reloadAll} />
      ) : (
        <FlatList
          data={c.orders.data ?? []}
          keyExtractor={(o) => o.id}
          contentContainerClassName="gap-2.5 px-gutter pb-10"
          ListHeaderComponent={header}
          ListEmptyComponent={c.orders.loading ? <Skeleton className="h-24" /> : <EmptyState title={t('admin.noOrders')} />}
          renderItem={({ item }) => <OrderCard order={item} onPress={() => c.openOrder(item.id)} />}
          refreshControl={<RefreshControl refreshing={false} onRefresh={c.reloadAll} tintColor={colors.accent} />}
        />
      )}
    </Screen>
  );
}
