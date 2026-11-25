import { ScrollView, Text } from 'react-native';
import { useCartStore } from '../../models/stores/cartStore';
import { useCheckoutStore } from '../../models/stores/checkoutStore';
import { subtotal } from '../../models/cart';
import { useT } from '../../i18n';
import { formatNpr } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { CartItemRow, SummaryCard } from '../components/Cards';
import { Eyebrow, Screen } from '../components/Layout';

// Phase 3 stub: shows what will be ordered. Login, address, server totals
// and placing the order arrive in Phase 4.
export function CheckoutScreen() {
  const t = useT();
  const buyNowItem = useCheckoutStore((s) => s.buyNowItem);
  const cartItems = useCartStore((s) => s.items);
  const items = buyNowItem ? [buyNowItem] : cartItems;

  return (
    <Screen>
      <AppHeader title={t('cart.checkout')} showCart={false} />
      <ScrollView contentContainerClassName="gap-3 px-gutter pb-10 pt-2">
        <Eyebrow>ORDER SUMMARY</Eyebrow>
        {items.map((item) => (
          <CartItemRow key={item.sku} item={item} />
        ))}
        <SummaryCard rows={[]} total={[t('cart.subtotal'), formatNpr(subtotal(items))]} />
        <Text className="font-body text-caption text-muted">Login and payment come in the next step.</Text>
      </ScrollView>
    </Screen>
  );
}
