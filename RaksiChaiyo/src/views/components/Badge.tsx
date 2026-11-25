import { Text, View } from 'react-native';
import { useT } from '../../i18n';

type Tone = 'success' | 'warning' | 'error' | 'accent' | 'neutral';

const tones: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  accent: 'bg-accent',
  neutral: 'bg-card-2',
};

/** Small coloured label (component inventory #4). */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return (
    <View className={`self-start rounded-pill px-2.5 py-1 ${tones[tone]}`}>
      <Text className={`font-body-bold text-caption ${tone === 'neutral' ? 'text-text' : 'text-on-accent'}`}>
        {label}
      </Text>
    </View>
  );
}

export const LOW_STOCK = 5;

/** In stock / Only N left / Out of stock. */
export function StockBadge({ stock }: { stock: number }) {
  const t = useT();
  if (stock <= 0) return <Badge tone="error" label={t('product.outOfStock')} />;
  if (stock <= LOW_STOCK) return <Badge tone="warning" label={t('product.lowStock', { count: stock })} />;
  return <Badge tone="success" label={t('product.inStock')} />;
}

/** Rounded info pill with a dot, e.g. "Delivering now". */
export function Pill({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-pill border border-border bg-card px-2.5 py-2">
      <View className="h-1.5 w-1.5 rounded-pill bg-accent" />
      <Text className="font-body text-caption text-muted">{label}</Text>
    </View>
  );
}
