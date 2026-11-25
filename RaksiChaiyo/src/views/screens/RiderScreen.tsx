import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRiderDeliveries } from '../../controllers/staffControllers';
import { useT } from '../../i18n';
import type { StaffOrder } from '../../models/types';
import { formatNpr } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { Eyebrow, Screen } from '../components/Layout';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { EmptyState, ErrorState, Skeleton } from '../components/StateView';
import { useColors } from '../theme';

function DeliveryCard({ order, c }: { order: StaffOrder; c: ReturnType<typeof useRiderDeliveries> }) {
  const t = useT();
  const collectCash = order.payment.method === 'cod' && order.payment.status !== 'paid';

  return (
    <View className="gap-2.5 rounded-lg border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-heading text-body text-text">{order.orderNumber}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
      <Text className="font-heading text-title text-text">
        {order.address.name} · {order.address.phone}
      </Text>
      <Text className="font-body text-body text-muted">
        {order.address.address}
        {order.address.landmark ? ` (${order.address.landmark})` : ''}
      </Text>
      {order.address.note ? <Text className="font-body-semibold text-label text-accent">“{order.address.note}”</Text> : null}
      <Text className="font-body text-label text-muted">
        {order.items.map((i) => `${i.quantity}× ${i.name} (${i.label})`).join(', ')}
      </Text>
      <View className={`self-start rounded-md px-3 py-2 ${collectCash ? 'bg-warning/15' : 'bg-success/15'}`}>
        <Text className={`font-body-bold text-label ${collectCash ? 'text-warning' : 'text-success'}`}>
          {collectCash ? t('rider.collect', { amount: formatNpr(order.total) }) : t('rider.paid')}
        </Text>
      </View>

      {order.status !== 'delivered' && (
        <>
          <View className="flex-row gap-2">
            <Button variant="secondary" icon="user" label={t('rider.call')} onPress={() => c.call(order)} className="flex-1" />
            <Button variant="secondary" icon="home" label={t('rider.map')} onPress={() => c.openMap(order)} className="flex-1" />
          </View>
          {order.status === 'preparing' && (
            <Button
              icon="truck"
              label={t('rider.pickUp')}
              loading={c.busy === `${order.id}-out_for_delivery`}
              disabled={!!c.busy}
              onPress={() => c.pickUp(order)}
            />
          )}
          {order.status === 'out_for_delivery' && (
            <Button
              icon="check"
              label={t('rider.deliver')}
              loading={c.busy === `${order.id}-delivered`}
              disabled={!!c.busy}
              onPress={() => c.deliver(order)}
            />
          )}
          {order.status === 'confirmed' && <Text className="font-body text-label text-muted">{t('rider.waiting')}</Text>}
        </>
      )}
    </View>
  );
}

export function RiderScreen() {
  const t = useT();
  const colors = useColors();
  const c = useRiderDeliveries();

  return (
    <Screen>
      <AppHeader title={t('rider.title')} showCart={false} />
      {c.deliveries.error && !c.deliveries.data ? (
        <ErrorState error={c.deliveries.error} onRetry={c.deliveries.reload} />
      ) : !c.deliveries.data ? (
        <Skeleton className="m-gutter h-64" />
      ) : (
        <ScrollView
          contentContainerClassName="gap-3 px-gutter pb-10 pt-2"
          refreshControl={<RefreshControl refreshing={false} onRefresh={c.deliveries.reload} tintColor={colors.accent} />}
        >
          <Eyebrow>{t('rider.toDeliver')}</Eyebrow>
          {c.toDeliver.length === 0 ? (
            <EmptyState icon="truck" title={t('rider.none')} />
          ) : (
            c.toDeliver.map((o) => <DeliveryCard key={o.id} order={o} c={c} />)
          )}
          {c.deliveredToday.length > 0 && (
            <>
              <View className="mt-3">
                <Eyebrow>{t('rider.deliveredToday')}</Eyebrow>
              </View>
              {c.deliveredToday.map((o) => (
                <DeliveryCard key={o.id} order={o} c={c} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
