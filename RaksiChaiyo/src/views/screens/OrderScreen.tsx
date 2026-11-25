import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useOrderController } from '../../controllers/orderControllers';
import type { PaymentOutcome } from '../../controllers/paymentController';
import { useT, type StringKey } from '../../i18n';
import type { Order, OrderStatus } from '../../models/types';
import { formatNpr } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { CartItemRow, SummaryCard } from '../components/Cards';
import { Icon } from '../components/Icon';
import { Eyebrow, Screen } from '../components/Layout';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { ErrorState, Skeleton } from '../components/StateView';
import { confirmDestructive } from '../confirm';
import { status as statusColors, useColors } from '../theme';

const STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

type Props = { id: string; placed?: boolean; payment?: PaymentOutcome };

export function OrderScreen({ id, placed, payment }: Props) {
  const t = useT();
  const colors = useColors();
  const c = useOrderController(id, payment);
  const o = c.order.data;

  return (
    <Screen>
      <AppHeader title={o ? o.orderNumber : ''} onBack={placed ? c.goHome : undefined} />
      {c.order.error && !o ? (
        <ErrorState error={c.order.error} onRetry={c.order.reload} />
      ) : !o ? (
        <View className="gap-3 p-gutter">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-gutter pb-10 pt-2"
          refreshControl={<RefreshControl refreshing={c.order.loading} onRefresh={c.order.reload} tintColor={colors.accent} />}
        >
          {placed && !c.awaitingEsewa && o.status !== 'cancelled' && (
            <View className="items-center gap-2 py-4">
              <Animated.View entering={ZoomIn.springify().delay(100)}>
                <View className="h-[74px] w-[74px] items-center justify-center rounded-pill bg-accent">
                  <Icon name="check" size={38} color={statusColors.onAccent} strokeWidth={2.6} />
                </View>
              </Animated.View>
              <Text className="font-display text-heading text-text">{t('order.confirmedTitle')}</Text>
            </View>
          )}

          {c.awaitingEsewa && <EsewaPanel c={c} />}

          <SummaryCard
            rows={[
              [t('order.number'), o.orderNumber],
              [t('payment.method'), t(o.payment.method === 'esewa' ? 'payment.esewa' : 'payment.cod')],
              [t('payment.statusLabel'), t(`payment.status.${o.payment.status}` as StringKey)],
              ...(ACTIVE(o) ? ([[t('order.eta'), t('order.etaValue')]] as [string, string][]) : []),
            ]}
            total={[t('order.total'), formatNpr(o.total)]}
          />

          <View className="gap-3 rounded-lg border border-border bg-card p-4">
            <View className="flex-row items-center justify-between">
              <Eyebrow>{t('order.progress')}</Eyebrow>
              <OrderStatusBadge status={o.status} />
            </View>
            <Text className="font-heading text-title text-text">{t(`order.status.${o.status}` as StringKey)}</Text>
            {o.status !== 'cancelled' && o.status !== 'payment_failed' && <Timeline order={o} />}
          </View>

          {o.status === 'out_for_delivery' && o.rider && (
            <View className="flex-row items-center gap-3 rounded-lg border border-accent bg-accent/10 p-4">
              <Icon name="truck" size={26} color={colors.accent} />
              <Text className="flex-1 font-body-semibold text-body text-text">{t('order.rider', { name: o.rider.name })}</Text>
              <Button variant="ghost" label={t('order.callRider')} onPress={c.callRider} />
            </View>
          )}

          <View className="gap-2">
            <Eyebrow>{t('order.deliverTo').toUpperCase()}</Eyebrow>
            <Text className="font-body-semibold text-body text-text">
              {o.address.name} · {o.address.phone}
            </Text>
            <Text className="font-body text-body text-muted">
              {o.address.address}
              {o.address.landmark ? ` (${o.address.landmark})` : ''}
            </Text>
          </View>

          <View className="gap-2.5">
            <Eyebrow>{t('order.items').toUpperCase()}</Eyebrow>
            {o.items.map((line) => (
              <CartItemRow key={line.sku} item={{ ...line, productId: line.product, maxQuantity: line.quantity }} />
            ))}
            <SummaryCard
              rows={[
                [t('cart.subtotal'), formatNpr(o.subtotal)],
                [t('checkout.deliveryFee'), formatNpr(o.deliveryFee)],
              ]}
              total={[t('checkout.total'), formatNpr(o.total)]}
            />
          </View>

          <View className="gap-2">
            {c.canCancel && (
              <Button
                variant="secondary"
                label={t('order.cancel')}
                loading={c.busy === 'cancel'}
                disabled={!!c.busy}
                onPress={() =>
                  confirmDestructive(t('confirm.cancelTitle'), t('confirm.cancelBody'), t('confirm.cancelYes'), t('confirm.keep'), c.cancel)
                }
              />
            )}
            <Button variant="ghost" label={t('order.help')} onPress={c.callShop} />
            {placed && <Button variant="ghost" label={t('order.backHome')} onPress={c.goHome} />}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const ACTIVE = (o: Order) => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status);

function EsewaPanel({ c }: { c: ReturnType<typeof useOrderController> }) {
  const t = useT();
  const message =
    c.lastOutcome === 'failed'
      ? t('payment.failed')
      : c.lastOutcome === 'cancelled' || c.lastOutcome === 'dismissed'
        ? t('payment.cancelled')
        : c.lastOutcome === 'pending'
          ? t('payment.pending')
          : t('payment.awaitingHint');

  return (
    <View className="gap-3 rounded-lg border border-warning bg-warning/10 p-4">
      <Text className="font-heading text-title text-text">{t('payment.awaiting')}</Text>
      <Text className="font-body text-body text-muted">{message}</Text>
      <Button label={t('payment.retry')} loading={c.busy === 'pay'} disabled={!!c.busy} onPress={c.payWithEsewa} />
      <Button variant="secondary" label={t('payment.useCod')} loading={c.busy === 'cod'} disabled={!!c.busy} onPress={c.payOnDelivery} />
    </View>
  );
}

/** Vertical steps: done (filled), current (ring), upcoming (grey). */
function Timeline({ order }: { order: Order }) {
  const t = useT();
  const colors = useColors();
  const current = STEPS.indexOf(order.status);
  const timeOf = (s: OrderStatus) => order.statusHistory.find((h) => h.status === s)?.at;

  return (
    <View className="mt-1">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const at = timeOf(step);
        return (
          <View key={step} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`h-5 w-5 items-center justify-center rounded-pill ${
                  done ? 'bg-accent' : 'border-2 border-border bg-card'
                } ${i === current ? 'border-4 border-accent/30' : ''}`}
              >
                {done && i < current && <Icon name="check" size={11} color={statusColors.onAccent} strokeWidth={3} />}
              </View>
              {i < STEPS.length - 1 && <View className={`w-0.5 flex-1 ${i < current ? 'bg-accent' : 'bg-border'}`} style={{ minHeight: 22 }} />}
            </View>
            <View className="flex-1 pb-3">
              <Text className={`font-body-semibold text-body ${done ? 'text-text' : 'text-muted'}`}>
                {t(`status.${step}` as StringKey)}
              </Text>
              {at && (
                <Text className="font-body text-caption" style={{ color: colors.muted }}>
                  {new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
