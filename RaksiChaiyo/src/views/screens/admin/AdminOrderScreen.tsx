import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useAdminOrder } from '../../../controllers/staffControllers';
import { useT, type StringKey } from '../../../i18n';
import { formatNpr } from '../../../utils/format';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { CartItemRow, SummaryCard } from '../../components/Cards';
import { Chip } from '../../components/Chip';
import { Eyebrow, Screen } from '../../components/Layout';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { ErrorState, Skeleton } from '../../components/StateView';
import { confirmDestructive } from '../../confirm';
import { useColors } from '../../theme';

export function AdminOrderScreen({ id }: { id: string }) {
  const t = useT();
  const colors = useColors();
  const c = useAdminOrder(id);
  const o = c.order.data;

  return (
    <Screen>
      <AppHeader title={o?.orderNumber ?? ''} showCart={false} />
      {c.order.error && !o ? (
        <ErrorState error={c.order.error} onRetry={c.order.reload} />
      ) : !o ? (
        <Skeleton className="m-gutter h-64" />
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-gutter pb-10 pt-2"
          refreshControl={<RefreshControl refreshing={false} onRefresh={c.order.reload} tintColor={colors.accent} />}
        >
          <View className="flex-row items-center justify-between">
            <OrderStatusBadge status={o.status} />
            <Text className="font-body text-caption text-muted">{new Date(o.createdAt).toLocaleString()}</Text>
          </View>

          {c.next && (
            <View className="gap-2">
              {c.nextBlockedReason && <Text className="font-body-semibold text-label text-warning">{c.nextBlockedReason}</Text>}
              <Button
                label={t(`admin.next.${c.next}` as StringKey)}
                loading={c.busy === c.next}
                disabled={!!c.busy || !!c.nextBlockedReason}
                onPress={c.advance}
              />
            </View>
          )}

          <View className="gap-1 rounded-lg border border-border bg-card p-4">
            <Eyebrow>{t('admin.customer').toUpperCase()}</Eyebrow>
            <Text className="font-heading text-body text-text">
              {o.address.name} · {o.address.phone}
            </Text>
            <Text className="font-body text-body text-muted">
              {o.address.address}
              {o.address.landmark ? ` (${o.address.landmark})` : ''}
            </Text>
            {o.address.note ? <Text className="font-body-semibold text-label text-accent">“{o.address.note}”</Text> : null}
            <Button variant="ghost" icon="user" label={t('admin.callCustomer')} onPress={c.callCustomer} className="self-start" />
          </View>

          <View className="gap-2">
            <Eyebrow>{t('admin.rider')}</Eyebrow>
            {o.rider && (
              <Text className="font-body-semibold text-body text-text">
                {o.rider.name} · {o.rider.phone}
              </Text>
            )}
            {c.canAssign &&
              (c.riders.data?.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {c.riders.data.map((r) => (
                    <Chip
                      key={r.id}
                      label={`${r.name} (${t('admin.riderBusy', { count: r.activeOrders })})`}
                      selected={o.rider?.id === r.id}
                      onPress={() => c.assign(r.id)}
                    />
                  ))}
                </View>
              ) : (
                <Text className="font-body text-label text-muted">{t('admin.noRiders')}</Text>
              ))}
          </View>

          <SummaryCard
            rows={[
              [t('payment.method'), t(o.payment.method === 'esewa' ? 'payment.esewa' : 'payment.cod')],
              [t('payment.statusLabel'), t(`payment.status.${o.payment.status}` as StringKey)],
              ...(o.payment.reference ? ([['eSewa ref', o.payment.reference]] as [string, string][]) : []),
              [t('cart.subtotal'), formatNpr(o.subtotal)],
              [t('checkout.deliveryFee'), formatNpr(o.deliveryFee)],
            ]}
            total={[t('checkout.total'), formatNpr(o.total)]}
          />

          <View className="gap-2.5">
            <Eyebrow>{t('order.items').toUpperCase()}</Eyebrow>
            {o.items.map((line) => (
              <CartItemRow key={line.sku} item={{ ...line, productId: line.product, maxQuantity: line.quantity }} />
            ))}
          </View>

          <View className="gap-1.5">
            <Eyebrow>{t('admin.history')}</Eyebrow>
            {o.statusHistory.map((h, i) => (
              <Text key={i} className="font-body text-label text-muted">
                {new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {t(`status.${h.status}` as StringKey)}
                {h.note ? ` · ${h.note}` : ''}
              </Text>
            ))}
          </View>

          {c.canCancel && (
            <Button
              variant="danger"
              label={t('admin.reject')}
              loading={c.busy === 'cancelled'}
              disabled={!!c.busy}
              onPress={() =>
                confirmDestructive(t('confirm.cancelTitle'), t('confirm.cancelAdminBody'), t('confirm.cancelYes'), t('confirm.keep'), c.cancel)
              }
            />
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
