import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useCategoryController } from '../../controllers/catalogueControllers';
import { useT } from '../../i18n';
import { localize } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { ProductCard } from '../components/Cards';
import { Eyebrow, GridFiller, padToEven, Screen } from '../components/Layout';
import { EmptyState, ErrorState, Skeleton } from '../components/StateView';
import { useColors } from '../theme';

export function CategoryScreen({ slug }: { slug: string }) {
  const t = useT();
  const colors = useColors();
  const { category, products, openProduct } = useCategoryController(slug);
  const title = category ? localize(category.name) : '';

  let body;
  if (products.loading && !products.data) {
    body = (
      <View className="gap-3 px-gutter pt-2">
        {[0, 1].map((row) => (
          <View key={row} className="flex-row gap-3">
            <Skeleton className="h-[250px] flex-1" />
            <Skeleton className="h-[250px] flex-1" />
          </View>
        ))}
      </View>
    );
  } else if (products.error && !products.data) {
    body = <ErrorState error={products.error} onRetry={products.reload} />;
  } else {
    body = (
      <FlatList
        data={padToEven(products.data)}
        keyExtractor={(p) => p?.id ?? 'filler'}
        numColumns={2}
        columnWrapperClassName="gap-3"
        contentContainerClassName="gap-3 px-gutter pb-10"
        ListHeaderComponent={
          <View className="mb-2 mt-1 flex-row items-end justify-between">
            <View className="gap-1">
              <Eyebrow>{t('category.eyebrow')}</Eyebrow>
              <Text className="font-display text-heading text-text">{title}</Text>
            </View>
            <Text className="font-body text-caption text-muted">
              {t('category.items', { count: products.data?.length ?? 0 })}
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title={t('category.empty')} />}
        renderItem={({ item }) =>
          item ? <ProductCard product={item} onPress={() => openProduct(item.id)} /> : <GridFiller />
        }
        refreshControl={
          <RefreshControl refreshing={products.loading} onRefresh={products.reload} tintColor={colors.accent} />
        }
      />
    );
  }

  return (
    <Screen>
      <AppHeader title={title} />
      {body}
    </Screen>
  );
}
