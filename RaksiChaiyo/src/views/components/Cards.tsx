import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useT } from '../../i18n';
import type { CartItem, Category, Product } from '../../models/types';
import { formatNpr, localize } from '../../utils/format';
import { status } from '../theme';
import { StockBadge } from './Badge';
import { Icon } from './Icon';
import { RemoteImage } from './Layout';
import { QuantityStepper } from './QuantityStepper';

/** Big photo tile on Home (component inventory #6). */
export function CategoryCard({ category, onPress }: { category: Category; onPress: () => void }) {
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={localize(category.name)}
      onPress={onPress}
      className="h-[230px] flex-1 overflow-hidden rounded-[22px] bg-card active:opacity-90"
    >
      <RemoteImage source={category.image} contentFit="cover" transition={200} className="absolute inset-0" />
      {/* Dark fade at the bottom keeps the white text readable on any photo. */}
      <View className="absolute inset-x-0 bottom-0 h-3/4 bg-black/35" />
      <View className="absolute inset-x-0 bottom-0 h-2/5 bg-black/35" />
      <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-pill bg-white/15">
        <Icon name="arrow" size={16} color="#ffffff" />
      </View>
      <View className="absolute inset-x-4 bottom-4 gap-0.5">
        <Text className="font-display text-title text-white">{localize(category.name)}</Text>
        <Text className="font-body text-label text-white/80">{localize(category.subtitle)}</Text>
        {category.alcoholic && <Text className="mt-1 font-body text-[8px] text-white/70">{t('category.ageTag')}</Text>}
      </View>
    </Pressable>
  );
}

/** Grid card on the product list (component inventory #7). */
export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const first = product.variants[0];
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const soldOut = stock <= 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${localize(product.name)}, ${formatNpr(minPrice)}`}
      onPress={onPress}
      className={`flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-card active:opacity-90 ${
        soldOut ? 'opacity-60' : ''
      }`}
    >
      <View className="h-[142px] bg-card-2 p-3">
        <RemoteImage source={product.image} contentFit="contain" transition={200} className="h-full w-full" />
      </View>
      <View className="gap-1 p-3 pb-4">
        <Text className="font-body text-micro text-muted">{first?.label}</Text>
        <Text numberOfLines={1} className="font-heading text-[14px] text-text">
          {localize(product.name)}
        </Text>
        <Text className="font-heading text-body text-accent">
          {product.variants.length > 1 ? `${formatNpr(minPrice)}+` : formatNpr(minPrice)}
        </Text>
        <View className="mt-1">
          <StockBadge stock={stock} />
        </View>
      </View>
      {!soldOut && (
        <View className="absolute bottom-3 right-3 h-7 w-7 items-center justify-center rounded-[10px] bg-accent">
          <Icon name="plus" size={17} color={status.onAccent} />
        </View>
      )}
    </Pressable>
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
  return (
    <View className="flex-row items-center gap-3 rounded-[18px] border border-border bg-card p-2.5">
      <View className="h-[68px] w-[65px] rounded-[12px] bg-card-2 p-1.5">
        <RemoteImage source={item.image} contentFit="contain" className="h-full w-full" />
      </View>
      <View className="flex-1 gap-1">
        <Text numberOfLines={1} className="font-heading text-body text-text">
          {item.name}
        </Text>
        <Text className="font-body text-caption text-muted">
          {item.label}
          {onQuantity ? '' : ` × ${item.quantity}`}
        </Text>
        <Text className="font-heading text-body text-accent">{formatNpr(item.price * item.quantity)}</Text>
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
          <View className="flex-row justify-between">
            <Text className="font-heading text-body text-text">{total[0]}</Text>
            <Text className="font-display text-title text-accent">{total[1]}</Text>
          </View>
        </>
      )}
      {children}
    </View>
  );
}
