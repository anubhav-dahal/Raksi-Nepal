import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartController } from '../../controllers/cartController';
import { useT } from '../../i18n';
import { formatNpr } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { CartItemRow } from '../components/Cards';
import { Screen } from '../components/Layout';
import { EmptyState } from '../components/StateView';

export function CartScreen() {
  const t = useT();
  const cart = useCartController();

  return (
    <Screen>
      <AppHeader title={t('cart.title')} showCart={false} />
      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.sku}
        contentContainerClassName="flex-grow gap-2.5 px-gutter pb-6 pt-2"
        ListEmptyComponent={
          <EmptyState
            icon="bag"
            title={t('cart.empty')}
            hint={t('cart.emptyHint')}
            actionLabel={t('cart.browse')}
            onAction={cart.browse}
          />
        }
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onQuantity={(q) => cart.setQuantity(item.sku, q)}
            onRemove={() => cart.remove(item.sku)}
          />
        )}
      />
      {cart.items.length > 0 && (
        <SafeAreaView edges={['bottom']} className="gap-3 border-t border-border bg-bg px-gutter pt-3">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="font-body text-label text-muted">{t('cart.subtotal')}</Text>
              <Text className="font-display text-heading text-text">{formatNpr(cart.subtotal)}</Text>
            </View>
            <Text className="max-w-[55%] text-right font-body text-caption text-muted">{t('cart.feeNote')}</Text>
          </View>
          <Button label={t('cart.checkout')} onPress={cart.checkout} className="mb-2" />
        </SafeAreaView>
      )}
    </Screen>
  );
}
