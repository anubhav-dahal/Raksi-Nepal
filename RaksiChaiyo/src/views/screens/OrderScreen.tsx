import { ScrollView, Text } from 'react-native';
import { useOrderQuery } from '../../controllers/orderControllers';
import { useT } from '../../i18n';
import { formatNpr } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { CartItemRow, SummaryCard } from '../components/Cards';
import { Eyebrow, Screen } from '../components/Layout';
import { ErrorState, Skeleton } from '../components/StateView';

export function OrderScreen({ id }: { id: string }) {
  const t = useT();
  const order = useOrderQuery(id);
  const o = order.data;

  return (
    <Screen>
      <AppHeader title={o ? t('order.title', { number: o.orderNumber }) : ''} />
      {order.error && !o ? (
        <ErrorState error={order.error} onRetry={order.reload} />
      ) : !o ? (
        <Skeleton className="m-gutter h-64" />
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-gutter pb-10 pt-2">
          <Eyebrow>{t('order.placed').toUpperCase()}</Eyebrow>
          <Text className="font-display text-heading text-text">{o.orderNumber}</Text>
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
        </ScrollView>
      )}
    </Screen>
  );
}
