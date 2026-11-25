import { router } from 'expo-router';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useCheckoutController } from '../../controllers/checkoutController';
import { payWithEsewa } from '../../controllers/paymentController';
import { useT } from '../../i18n';
import { formatNpr } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { CartItemRow, SummaryCard } from '../components/Cards';
import { Input } from '../components/Input';
import { BottomBar, Eyebrow, Screen } from '../components/Layout';
import { PaymentOption } from '../components/PaymentOption';
import { EmptyState, ErrorState, Skeleton } from '../components/StateView';

const ESEWA_GREEN = '#60bb46';

export function CheckoutScreen() {
  const t = useT();
  const c = useCheckoutController({
    // eSewa: open the payment right after the order is created, then show the order.
    onPlaced: async (order) => {
      const outcome = order.payment.method === 'esewa' ? await payWithEsewa(order.id).catch(() => 'failed' as const) : undefined;
      router.replace({ pathname: '/order/[id]', params: { id: order.id, placed: '1', ...(outcome ? { payment: outcome } : {}) } });
    },
  });
  const q = c.quote.data;

  if (c.items.length === 0) {
    return (
      <Screen>
        <AppHeader title={t('checkout.title')} showCart={false} />
        <EmptyState icon="bag" title={t('checkout.empty')} actionLabel={t('cart.browse')} onAction={() => router.dismissTo('/')} />
      </Screen>
    );
  }

  return (
    <Screen edges={c.isLoggedIn ? ['top'] : ['top', 'bottom']}>
      <AppHeader title={t('checkout.title')} showCart={false} />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerClassName="gap-3 px-gutter pb-8 pt-2" keyboardShouldPersistTaps="handled">
          <Eyebrow>{t('checkout.summary')}</Eyebrow>
          {c.items.map((item) => (
            <CartItemRow key={item.sku} item={item} />
          ))}

          {c.problems.length > 0 && (
            <View className="gap-1 rounded-md border border-error bg-error/10 p-3">
              <Text className="font-body-bold text-label text-error">{t('checkout.problems')}</Text>
              {c.problems.map((p) => (
                <Text key={p.sku} className="font-body text-label text-error">
                  • {c.items.find((i) => i.sku === p.sku)?.name ?? p.sku}: {p.message}
                </Text>
              ))}
            </View>
          )}

          {c.quote.error && !q ? (
            <ErrorState error={c.quote.error} onRetry={c.quote.reload} />
          ) : !q ? (
            <Skeleton className="h-32" />
          ) : (
            <SummaryCard
              rows={[
                [t('cart.subtotal'), formatNpr(q.subtotal)],
                [t('checkout.deliveryFee'), formatNpr(q.deliveryFee)],
              ]}
              total={[t('checkout.total'), formatNpr(q.total)]}
            >
              <Text className="font-body text-micro text-muted">{t('checkout.serverTotal')}</Text>
            </SummaryCard>
          )}

          <View className="mt-3">
            <Eyebrow>{t('checkout.delivery')}</Eyebrow>
          </View>
          {c.isLoggedIn ? (
            <View className="gap-3">
              <Input label={t('checkout.recipient')} value={c.address.name} onChangeText={(v) => c.updateAddress('name', v)} error={c.addressErrors.name} />
              <Input
                label={t('checkout.recipientPhone')}
                type="phone"
                value={c.address.phone}
                onChangeText={(v) => c.updateAddress('phone', v)}
                error={c.addressErrors.phone}
              />
              <Input
                label={t('checkout.address')}
                value={c.address.address}
                onChangeText={(v) => c.updateAddress('address', v)}
                error={c.addressErrors.address}
                placeholder="Ward 5, Dhamboji Chowk, Nepalgunj"
              />
              <Input label={t('checkout.landmark')} value={c.address.landmark ?? ''} onChangeText={(v) => c.updateAddress('landmark', v)} />
              <Input label={t('checkout.note')} value={c.address.note ?? ''} onChangeText={(v) => c.updateAddress('note', v)} />
            </View>
          ) : (
            <View className="gap-3 rounded-lg border border-border bg-card p-4">
              <Text className="font-body text-body text-muted">{t('checkout.loginPrompt')}</Text>
              <Button icon="user" label={t('checkout.loginButton')} onPress={c.login} />
            </View>
          )}

          <View className="mt-3">
            <Eyebrow>{t('checkout.payment')}</Eyebrow>
          </View>
          <PaymentOption
            mark="रु"
            title={t('checkout.cod')}
            note={t('checkout.codNote')}
            selected={c.paymentMethod === 'cod'}
            onPress={() => c.setPaymentMethod('cod')}
          />
          <PaymentOption
            mark="e"
            markColor={ESEWA_GREEN}
            title={t('checkout.esewa')}
            note={t('checkout.esewaNote')}
            selected={c.paymentMethod === 'esewa'}
            onPress={() => c.setPaymentMethod('esewa')}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {c.isLoggedIn && (
        <BottomBar>
          <Button
            label={t(c.paymentMethod === 'esewa' ? 'checkout.payEsewa' : 'checkout.placeOrder', {
              total: q ? formatNpr(q.total) : '…',
            })}
            loading={c.placing}
            disabled={!c.canPlace}
            onPress={c.placeOrder}
          />
        </BottomBar>
      )}
    </Screen>
  );
}
