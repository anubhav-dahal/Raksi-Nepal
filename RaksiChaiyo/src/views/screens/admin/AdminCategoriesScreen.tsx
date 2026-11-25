import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useAdminCategories } from '../../../controllers/catalogueAdminControllers';
import { useT } from '../../../i18n';
import { localize } from '../../../utils/format';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { BottomBar, Screen } from '../../components/Layout';
import { ProductImage } from '../../components/ProductImage';
import { ErrorState, Skeleton } from '../../components/StateView';
import { useColors } from '../../theme';

export function AdminCategoriesScreen() {
  const t = useT();
  const colors = useColors();
  const c = useAdminCategories();

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('admin.categories')} showCart={false} />
      {c.categories.error && !c.categories.data ? (
        <ErrorState error={c.categories.error} onRetry={c.categories.reload} />
      ) : !c.categories.data ? (
        <Skeleton className="mx-gutter h-64" />
      ) : (
        <FlatList
          data={c.categories.data}
          keyExtractor={(x) => x.id}
          contentContainerClassName="gap-2.5 px-gutter pb-6 pt-1"
          refreshControl={<RefreshControl refreshing={false} onRefresh={c.categories.reload} tintColor={colors.accent} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => c.open(item.id)}
              className={`flex-row items-center gap-3 rounded-lg border border-border bg-card p-2.5 active:opacity-80 ${item.isActive ? '' : 'opacity-60'}`}
            >
              <View className="h-14 w-[72px] overflow-hidden rounded-md bg-card-2">
                <ProductImage src={item.image} name={localize(item.name)} fit="cover" size="tiny" />
              </View>
              <View className="flex-1">
                <Text className="font-heading text-body text-text">{localize(item.name)}</Text>
                <Text className="font-body text-caption text-muted">
                  {t('admin.productCount', { count: item.productCount })}
                  {item.alcoholic ? ' · 18+' : ''}
                  {item.isActive ? '' : ` · ${t('admin.hidden')}`}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <BottomBar>
        <Button icon="plus" label={t('admin.newCategory')} onPress={c.openNew} />
      </BottomBar>
    </Screen>
  );
}
