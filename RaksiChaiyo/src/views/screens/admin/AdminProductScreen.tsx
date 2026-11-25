import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useAdminProduct } from '../../../controllers/staffControllers';
import { useT, type StringKey } from '../../../i18n';
import type { AdminProduct, Variant } from '../../../models/types';
import { localize } from '../../../utils/format';
import { AppHeader } from '../../components/AppHeader';
import { StockBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Eyebrow, RemoteImage, Screen } from '../../components/Layout';
import { ErrorState, Skeleton } from '../../components/StateView';

type StockReason = 'restock' | 'adjustment' | 'damaged';
const REASONS: StockReason[] = ['restock', 'adjustment', 'damaged'];

/** Price + stock editor for one variant. */
function VariantEditor({ variant, c }: { variant: Variant; c: ReturnType<typeof useAdminProduct> }) {
  const t = useT();
  const [price, setPrice] = useState(String(variant.price));
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState<StockReason>('restock');
  const [note, setNote] = useState('');
  const [error, setError] = useState<{ price?: string; delta?: string }>({});

  useEffect(() => setPrice(String(variant.price)), [variant.price]);

  const savePrice = () => {
    if (!/^\d+$/.test(price.trim())) return setError({ price: t('admin.invalidNumber') });
    setError({});
    c.savePrice(variant.sku, Number(price.trim()));
  };

  const applyStock = async () => {
    const n = Number(delta.trim());
    if (!/^[+-]?\d+$/.test(delta.trim()) || n === 0) return setError({ delta: t('admin.invalidNumber') });
    setError({});
    const ok = await c.adjustStock(variant.sku, n, reason, note.trim());
    if (ok) {
      setDelta('');
      setNote('');
    }
  };

  return (
    <View className="gap-3 rounded-lg border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-heading text-body text-text">{variant.label}</Text>
          <Text className="font-body text-caption text-muted">{variant.sku}</Text>
        </View>
        <View className="items-end gap-1">
          <Text className="font-display text-title text-text">{variant.stock}</Text>
          <StockBadge stock={variant.stock} />
        </View>
      </View>

      <View className="flex-row items-end gap-2">
        <View className="flex-1">
          <Input label={t('admin.price')} value={price} onChangeText={setPrice} keyboardType="number-pad" error={error.price} />
        </View>
        <Button
          variant="secondary"
          label={t('admin.savePrice')}
          disabled={price === String(variant.price) || !!c.busy}
          loading={c.busy === `price-${variant.sku}`}
          onPress={savePrice}
          className={error.price ? 'mb-5' : ''}
        />
      </View>

      <Input
        label={t('admin.adjust')}
        value={delta}
        onChangeText={setDelta}
        keyboardType="numbers-and-punctuation"
        placeholder="+24"
        hint={t('admin.adjustHint')}
        error={error.delta}
      />
      <Text className="font-body-bold text-caption text-muted">{t('admin.reason')}</Text>
      <View className="flex-row flex-wrap gap-2">
        {REASONS.map((r) => (
          <Chip key={r} label={t(`admin.reason.${r}` as StringKey)} selected={reason === r} onPress={() => setReason(r)} />
        ))}
      </View>
      <Input label={t('admin.note')} value={note} onChangeText={setNote} />
      <Button label={t('admin.applyStock')} disabled={!delta || !!c.busy} loading={c.busy === `stock-${variant.sku}`} onPress={applyStock} />
    </View>
  );
}

export function AdminProductScreen({ id }: { id: string }) {
  const t = useT();
  const c = useAdminProduct(id);
  const p: AdminProduct | undefined = c.product;

  return (
    <Screen>
      <AppHeader title={p ? localize(p.name) : ''} showCart={false} />
      {c.products.error && !c.products.data ? (
        <ErrorState error={c.products.error} onRetry={c.products.reload} />
      ) : !p ? (
        <Skeleton className="m-gutter h-64" />
      ) : (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView contentContainerClassName="gap-4 px-gutter pb-10 pt-2" keyboardShouldPersistTaps="handled">
            <View className="flex-row items-center gap-3">
              <View className="h-20 w-20 rounded-md bg-card-2 p-2">
                <RemoteImage source={p.image} contentFit="contain" className="h-full w-full" />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-body text-caption text-muted">{localize(p.category.name)}</Text>
                <Text className="font-heading text-title text-text">{localize(p.name)}</Text>
                <Button
                  variant={p.isActive ? 'secondary' : 'primary'}
                  label={p.isActive ? t('admin.hide') : t('admin.show')}
                  loading={c.busy === 'active'}
                  disabled={!!c.busy}
                  onPress={c.toggleActive}
                  className="h-10 self-start"
                />
              </View>
            </View>

            {p.variants.map((v) => (
              <VariantEditor key={v.sku} variant={v} c={c} />
            ))}

            <View className="gap-2">
              <Eyebrow>{t('admin.movements')}</Eyebrow>
              {!c.movements.data ? (
                <Skeleton className="h-20" />
              ) : c.movements.data.length === 0 ? (
                <Text className="font-body text-label text-muted">{t('admin.noMovements')}</Text>
              ) : (
                c.movements.data.map((m) => (
                  <View key={m.id} className="flex-row items-center justify-between border-b border-border py-2">
                    <View className="flex-1">
                      <Text className="font-body-semibold text-label text-text">
                        {t(`admin.reason.${m.reason}` as StringKey)}
                        {m.order ? ` · ${m.order.orderNumber}` : ''}
                        {m.note ? ` · ${m.note}` : ''}
                      </Text>
                      <Text className="font-body text-caption text-muted">
                        {new Date(m.createdAt).toLocaleString()} · {m.by?.name ?? t('admin.system')} · {m.sku}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className={`font-heading text-body ${m.delta > 0 ? 'text-success' : 'text-error'}`}>
                        {m.delta > 0 ? `+${m.delta}` : m.delta}
                      </Text>
                      <Text className="font-body text-caption text-muted">→ {m.stockAfter}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}
