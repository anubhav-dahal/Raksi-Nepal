import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartCount } from '../../controllers/cartController';
import { useProductController } from '../../controllers/productController';
import { useT } from '../../i18n';
import { formatNpr, localize } from '../../utils/format';
import { StockBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { Glow } from '../components/Glow';
import { IconButton } from '../components/IconButton';
import { BottomBar, Divider, Screen } from '../components/Layout';
import { ProductImage } from '../components/ProductImage';
import { QuantityStepper } from '../components/QuantityStepper';
import { ErrorState, Skeleton } from '../components/StateView';
import { useColors } from '../theme';

export function ProductScreen({ id }: { id: string }) {
  const t = useT();
  const colors = useColors();
  const insets = useSafeAreaInsets();
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
  const name = localize(product.name);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="pb-6" bounces={false}>
        {/* Prototype .detail-image: teal glow behind the bottle, fading into the sheet. */}
        <View className="h-[380px] overflow-hidden bg-card-2" style={{ paddingTop: insets.top }}>
          <Glow color={colors.accent} opacity={0.32} spread={0.6} />
          <View className="absolute bottom-10 left-8 right-8" style={{ top: insets.top + 56 }}>
            <ProductImage src={product.image} name={name} size="large" />
          </View>
          <LinearGradient
            colors={['rgba(4,9,12,0.12)', 'transparent', colors.bg]}
            locations={[0, 0.55, 1]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            pointerEvents="none"
          />
        </View>

        <View className="-mt-7 gap-3 rounded-t-[28px] bg-bg px-5 pt-6">
          {category && <Text className="font-display text-caption tracking-[1.6px] text-accent">{localize(category.name).toUpperCase()}</Text>}
          <Text className="font-display text-[29px] leading-[33px] tracking-[-0.8px] text-text">{name}</Text>
          <Text className="font-body text-[12px] text-muted">{c.variant?.label}</Text>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="font-display text-[22px] text-accent">{c.variant ? formatNpr(c.variant.price) : ''}</Text>
            {c.canBuy && <QuantityStepper size="large" value={c.quantity} max={c.maxQuantity} onChange={c.setQuantity} />}
          </View>
          <StockBadge stock={c.variant?.stock ?? 0} />

          {product.variants.length > 1 && (
            <View className="mt-1 gap-2">
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
                      className={`rounded-md border px-3.5 py-2.5 ${selected ? 'border-accent bg-accent/10' : 'border-border bg-card'} ${
                        v.stock <= 0 ? 'opacity-50' : ''
                      }`}
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

          <Divider className="my-4" />
          <Text className="font-heading text-[14px] text-text">{t('product.about')}</Text>
          <Text className="font-body text-body leading-[21px] text-muted">{localize(product.description)}</Text>
          {product.alcoholic && (
            <View className="mt-1 self-start rounded-sm bg-accent/10 px-2.5 py-2">
              <Text className="font-body-bold text-micro text-accent">{t('product.alcoholNote')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomBar>
        <View className="flex-row gap-2.5">
          <Button variant="secondary" icon="bag" label={t('product.addToCart')} disabled={!c.canAdd} onPress={c.onAddToCart} className="flex-1" />
          <Button
            label={c.canBuy ? t('product.buyNow') : t('product.outOfStock')}
            disabled={!c.canBuy}
            onPress={c.onBuyNow}
            className="flex-[1.25]"
          />
        </View>
      </BottomBar>

      <View className="absolute inset-x-0 top-0 flex-row justify-between px-gutter" style={{ paddingTop: insets.top + 8 }} pointerEvents="box-none">
        <IconButton variant="glass" icon="back" accessibilityLabel={t('common.back')} onPress={() => router.back()} />
        <IconButton
          variant="glass"
          icon="bag"
          count={cartCount}
          accessibilityLabel={t('cart.label', { count: cartCount })}
          onPress={() => router.push('/cart')}
        />
      </View>
    </View>
  );
}
