import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { useAdminProducts } from '../../../controllers/staffControllers';
import { useT } from '../../../i18n';
import { formatNpr, localize } from '../../../utils/format';
import { AppHeader } from '../../components/AppHeader';
import { LOW_STOCK } from '../../components/Badge';
import { Screen } from '../../components/Layout';
import { ProductImage } from '../../components/ProductImage';
import { ErrorState, Skeleton } from '../../components/StateView';
import { useColors } from '../../theme';

export function AdminProductsScreen() {
  const t = useT();
  const colors = useColors();
  const c = useAdminProducts();

  return (
    <Screen>
      <AppHeader title={t('admin.products')} showCart={false} />
      <View className="px-gutter pb-2">
        <TextInput
          value={c.query}
          onChangeText={c.setQuery}
          placeholder={t('admin.search')}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          className="h-11 rounded-md border border-border bg-card px-4 font-body text-body text-text"
        />
      </View>
      {c.products.error && !c.products.data ? (
        <ErrorState error={c.products.error} onRetry={c.products.reload} />
      ) : !c.products.data ? (
        <Skeleton className="mx-gutter h-64" />
      ) : (
        <FlatList
          data={c.filtered}
          keyExtractor={(p) => p.id}
          contentContainerClassName="gap-2 px-gutter pb-10"
          refreshControl={<RefreshControl refreshing={false} onRefresh={c.products.reload} tintColor={colors.accent} />}
          renderItem={({ item: p }) => (
            <Pressable
              onPress={() => c.openProduct(p.id)}
              className={`flex-row items-center gap-3 rounded-lg border border-border bg-card p-2.5 active:opacity-80 ${p.isActive ? '' : 'opacity-60'}`}
            >
              <View className="h-12 w-12 rounded-sm bg-card-2 p-1">
                <ProductImage src={p.image} name={localize(p.name)} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text numberOfLines={1} className="font-heading text-body text-text">
                  {localize(p.name)}
                  {p.isActive ? '' : ` · ${t('admin.hidden')}`}
                </Text>
                {p.variants.map((v) => (
                  <Text key={v.sku} className="font-body text-caption text-muted">
                    {v.label} · {formatNpr(v.price)} ·{' '}
                    <Text className={v.stock <= 0 ? 'text-error' : v.stock <= LOW_STOCK ? 'text-warning' : 'text-muted'}>
                      {t('admin.stock')} {v.stock}
                    </Text>
                  </Text>
                ))}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
