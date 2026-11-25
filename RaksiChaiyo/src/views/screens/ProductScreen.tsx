import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartCount } from '../../controllers/cartController';
import { useProductController } from '../../controllers/productController';
import { useT } from '../../i18n';
import { formatNpr, localize } from '../../utils/format';
import { StockBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Divider, Eyebrow, RemoteImage, Screen } from '../components/Layout';
import { QuantityStepper } from '../components/QuantityStepper';
import { ErrorState, Skeleton } from '../components/StateView';

export function ProductScreen({ id }: { id: string }) {
  const t = useT();
  const cartCount = useCartCount();
  const c = useProductController(id);
  const product = c.product.data;

  if (!product) {
    return (
      <Screen>
        <View className="flex-row px-gutter pt-2">
          <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={() => router.back()} />
        </View>
        {c.product.error ? (
          <ErrorState error={c.product.error} onRetry={c.product.reload} />
        ) : (
          <View className="gap-4 p-gutter">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24" />
          </View>
        )}
      </Screen>
    );
  }

  const category = typeof product.category === 'object' ? product.category : null;

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="pb-8" bounces={false}>
        <View className="h-[340px] bg-card-2">
          <RemoteImage source={product.image} contentFit="contain" transition={200} className="absolute inset-6" />
        </View>

        <View className="-mt-7 gap-3 rounded-t-2xl bg-bg px-gutter pt-6">
          {category && <Eyebrow>{localize(category.name).toUpperCase()}</Eyebrow>}
          <Text className="font-display text-heading text-text">{localize(product.name)}</Text>
          <Text className="font-body text-label text-muted">{c.variant?.label}</Text>

          <View className="flex-row items-center justify-between">
            <Text className="font-display text-heading text-accent">{c.variant ? formatNpr(c.variant.price) : ''}</Text>
            {c.canBuy && (
              <QuantityStepper size="large" value={c.quantity} max={c.maxQuantity} onChange={c.setQuantity} />
            )}
          </View>
          <StockBadge stock={c.variant?.stock ?? 0} />

          {product.variants.length > 1 && (
            <View className="gap-2">
              <Text className="font-heading text-[14px] text-text">{t('product.size')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {product.variants.map((v) => {
                  const selected = v.sku === c.variant?.sku;
                  return (
                    <Pressable
                      key={v.sku}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => c.selectVariant(v.sku)}
                      className={`rounded-md border px-3.5 py-2.5 ${
                        selected ? 'border-accent bg-accent/10' : 'border-border bg-card'
                      } ${v.stock <= 0 ? 'opacity-50' : ''}`}
                    >
                      <Text className={`font-body-semibold text-label ${selected ? 'text-accent' : 'text-text'}`}>
                        {v.label} · {formatNpr(v.price)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <Divider className="my-3" />
          <Text className="font-heading text-[14px] text-text">{t('product.about')}</Text>
          <Text className="font-body text-body leading-[20px] text-muted">{localize(product.description)}</Text>
          {product.alcoholic && (
            <View className="self-start rounded-sm bg-accent/10 px-2.5 py-2">
              <Text className="font-body-bold text-micro text-accent">{t('product.alcoholNote')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="border-t border-border bg-bg px-gutter pt-3">
        <View className="flex-row gap-2.5 pb-2">
          <Button
            variant="secondary"
            icon="bag"
            label={t('product.addToCart')}
            disabled={!c.canAdd}
            onPress={c.onAddToCart}
            className="flex-1"
          />
          <Button
            label={c.canBuy ? t('product.buyNow') : t('product.outOfStock')}
            disabled={!c.canBuy}
            onPress={c.onBuyNow}
            className="flex-[1.25]"
          />
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['top']} className="absolute inset-x-0 top-0" pointerEvents="box-none">
        <View className="flex-row justify-between px-gutter pt-2" pointerEvents="box-none">
          <IconButton variant="glass" icon="back" accessibilityLabel={t('common.back')} onPress={() => router.back()} />
          <IconButton
            variant="glass"
            icon="bag"
            count={cartCount}
            accessibilityLabel={t('cart.label', { count: cartCount })}
            onPress={() => router.push('/cart')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
