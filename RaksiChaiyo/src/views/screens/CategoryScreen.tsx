import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useCategoryController } from '../../controllers/catalogueControllers';
import { useT } from '../../i18n';
import { localize } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { CategoryBanner, ProductCard } from '../components/Cards';
import { Eyebrow, GridFiller, padToEven, Screen } from '../components/Layout';
import { EmptyState, ErrorState, Skeleton } from '../components/StateView';
import { useColors } from '../theme';

export function CategoryScreen({ slug }: { slug: string }) {
  const t = useT();
  const colors = useColors();
  const { category, products, openProduct, quickAdd } = useCategoryController(slug);
  const title = category ? localize(category.name) : '';

  // Prototype: photo banner, then "OUR PICKS / Choose your favourite" with the count.
  const header = (
    <View className="mb-2 mt-1 gap-6">
      {category ? <CategoryBanner category={category} /> : <Skeleton className="h-[154px]" />}
      <View className="flex-row items-end justify-between px-0.5">
        <View className="gap-1">
          <Eyebrow>{t('category.eyebrow')}</Eyebrow>
          <Text className="font-heading text-title text-text">{t('category.heading')}</Text>
        </View>
        {products.data && (
          <Text className="font-body text-label text-muted">{t('category.items', { count: products.data.length })}</Text>
        )}
      </View>
    </View>
  );

  let body;
  if (products.error && !products.data) {
    body = <ErrorState error={products.error} onRetry={products.reload} />;
  } else if (!products.data) {
    body = (
      <View className="gap-3 px-gutter pt-1">
        {header}
        {[0, 1].map((row) => (
          <View key={row} className="flex-row gap-3">
            <Skeleton className="h-[250px] flex-1" />
            <Skeleton className="h-[250px] flex-1" />
          </View>
        ))}
      </View>
    );
  } else {
    body = (
      <FlatList
        data={padToEven(products.data)}
        keyExtractor={(p) => p?.id ?? 'filler'}
        numColumns={2}
        columnWrapperClassName="gap-3"
        contentContainerClassName="gap-3 px-gutter pb-8"
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState title={t('category.empty')} />}
        renderItem={({ item, index }) =>
          item ? (
            <ProductCard product={item} index={index} onPress={() => openProduct(item.id)} onAdd={() => quickAdd(item)} />
          ) : (
            <GridFiller />
          )
        }
        refreshControl={<RefreshControl refreshing={false} onRefresh={products.reload} tintColor={colors.accent} />}
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
