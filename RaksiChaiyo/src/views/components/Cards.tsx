import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useT } from '../../i18n';
import type { CartItem, Category, Product } from '../../models/types';
import { formatNpr, localize } from '../../utils/format';
import { status, useColors } from '../theme';
import { StockBadge } from './Badge';
import { Glow } from './Glow';
import { Icon } from './Icon';
import { ProductImage } from './ProductImage';
import { QuantityStepper } from './QuantityStepper';

// Prototype .card-shade: one smooth dark fade from the bottom.
const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;
const SHADE = ['rgba(5,10,14,0.92)', 'rgba(5,10,14,0.45)', 'rgba(5,10,14,0.12)'] as const;

/** Big photo tile on Home (component inventory #6). */
export function CategoryCard({ category, onPress, index = 0 }: { category: Category; onPress: () => void; index?: number }) {
  const name = localize(category.name);
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(450)} style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={onPress}
        className="h-[230px] overflow-hidden rounded-[22px] bg-card active:opacity-90"
        style={{ boxShadow: '0 18px 36px rgba(0,0,0,0.35)' }}
      >
        <ProductImage src={category.image} name={name} fit="cover" />
        <LinearGradient colors={SHADE} locations={[0, 0.45, 1]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={FILL} />
        <View className="absolute inset-x-4 bottom-4">
          <Text className="font-display text-title text-white">{name}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Wide photo banner at the top of a category (prototype .category-banner). */
export function CategoryBanner({ category }: { category: Category }) {
  const name = localize(category.name);
  return (
    <View className="h-[154px] overflow-hidden rounded-[24px] bg-card">
      <ProductImage src={category.image} name={name} fit="cover" />
      <LinearGradient colors={SHADE} locations={[0, 0.5, 1]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={FILL} />
      <View className="absolute bottom-[18px] left-5">
        <Text className="font-display text-[27px] text-white">{name}</Text>
      </View>
    </View>
  );
}

type ProductCardProps = { product: Product; onPress: () => void; onAdd?: () => void; index?: number };

/** Grid card on the product list (component inventory #7). The + adds one straight to the cart. */
export function ProductCard({ product, onPress, onAdd, index = 0 }: ProductCardProps) {
  const colors = useColors();
  const first = product.variants[0];
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const soldOut = stock <= 0;
  const name = localize(product.name);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(400)} style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${formatNpr(minPrice)}`}
        onPress={onPress}
        className={`overflow-hidden rounded-xl border border-border bg-card active:opacity-90 ${soldOut ? 'opacity-60' : ''}`}
        style={{ boxShadow: '0 14px 30px rgba(0,0,0,0.28)' }}
      >
        <View className="h-[142px] overflow-hidden bg-card-2">
          <Glow color={colors.accent} opacity={0.22} spread={0.6} />
          <View className="absolute inset-3">
            <ProductImage src={product.image} name={name} />
          </View>
        </View>
        <View className="gap-1 p-3 pb-4">
          <Text className="font-body text-micro text-muted">{first?.label}</Text>
          <Text numberOfLines={1} className="font-heading text-[14px] text-text">
            {name}
          </Text>
          <Text className="font-display text-body text-accent">
            {product.variants.length > 1 ? `${formatNpr(minPrice)}+` : formatNpr(minPrice)}
          </Text>
          <View className="mt-1">
            <StockBadge stock={stock} />
          </View>
        </View>
        {!soldOut && (
          <Pressable
            accessibilityLabel={`Add ${name} to cart`}
            onPress={onAdd ?? onPress}
            hitSlop={8}
            className="absolute bottom-3 right-3 h-8 w-8 items-center justify-center rounded-[10px] bg-accent active:scale-90"
            style={{ boxShadow: '0 6px 14px rgba(33,184,166,0.45)' }}
          >
            <Icon name="plus" size={17} color={status.onAccent} strokeWidth={2.4} />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

type CartItemProps = {
  item: CartItem;
  onQuantity?: (quantity: number) => void;
  onRemove?: () => void;
};

/** Row in cart and checkout (component inventory #8). Read-only without handlers. */
export function CartItemRow({ item, onQuantity, onRemove }: CartItemProps) {
  const t = useT();
  const colors = useColors();
  return (
    <View className="flex-row items-center gap-3 rounded-[18px] border border-border bg-card p-2.5">
      <View className="h-[68px] w-[65px] overflow-hidden rounded-[12px] bg-card-2">
        <Glow color={colors.accent} opacity={0.2} spread={0.7} />
        <View className="absolute inset-1.5">
          <ProductImage src={item.image} name={item.name} size="tiny" />
        </View>
      </View>
      <View className="flex-1 gap-1">
        <Text numberOfLines={1} className="font-heading text-body text-text">
          {item.name}
        </Text>
        <Text className="font-body text-caption text-muted">
          {item.label}
          {onQuantity ? '' : ` × ${item.quantity}`}
        </Text>
        <Text className="font-display text-body text-accent">{formatNpr(item.price * item.quantity)}</Text>
      </View>
      <View className="items-end gap-2">
        {onRemove && (
          <Pressable accessibilityLabel={t('cart.remove')} onPress={onRemove} hitSlop={8}>
            <Icon name="trash" size={18} color={status.error} />
          </Pressable>
        )}
        {onQuantity && <QuantityStepper value={item.quantity} max={item.maxQuantity} onChange={onQuantity} />}
      </View>
    </View>
  );
}

/** Label/value rows then a bold total (component inventory #9). */
export function SummaryCard({ rows, total, children }: { rows: [string, string][]; total?: [string, string]; children?: ReactNode }) {
  return (
    <View className="gap-2.5 rounded-[18px] border border-border bg-card p-4">
      {rows.map(([label, value]) => (
        <View key={label} className="flex-row justify-between">
          <Text className="font-body text-label text-muted">{label}</Text>
          <Text className="font-body-semibold text-label text-text">{value}</Text>
        </View>
      ))}
      {total && (
        <>
          <View className="my-1 h-px bg-border" />
          <View className="flex-row items-center justify-between">
            <Text className="font-heading text-body text-text">{total[0]}</Text>
            <Text className="font-display text-title text-accent">{total[1]}</Text>
          </View>
        </>
      )}
      {children}
    </View>
  );
}
