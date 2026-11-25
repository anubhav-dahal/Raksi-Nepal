import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { useCategoryForm } from '../../../controllers/catalogueAdminControllers';
import { useT } from '../../../i18n';
import { formatNpr, localize } from '../../../utils/format';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { PhotoField, SwitchRow } from '../../components/FormBits';
import { Input } from '../../components/Input';
import { BottomBar, Eyebrow, Screen } from '../../components/Layout';
import { ProductImage } from '../../components/ProductImage';
import { EmptyState, Skeleton } from '../../components/StateView';

/** New category (id "new") or edit one: photo, name, 18+, visible; plus its products. */
export function AdminCategoryScreen({ id }: { id: string }) {
  const t = useT();
  const c = useCategoryForm(id);

  if (c.notFound) {
    return (
      <Screen>
        <AppHeader back showCart={false} />
        <EmptyState icon="alert" title={t('admin.notFound')} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <AppHeader title={c.isNew ? t('admin.newCategory') : t('admin.editCategory')} showCart={false} />
      {c.loading ? (
        <Skeleton className="mx-gutter h-64" />
      ) : (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView contentContainerClassName="gap-3 px-gutter pb-6 pt-1" keyboardShouldPersistTaps="handled">
            <PhotoField shape="wide" image={c.image} name={c.name} uploading={c.uploading} onPress={c.changePhoto} />
            <Input label={t('admin.name')} value={c.name} onChangeText={c.setName} error={c.error} placeholder="Beer" />
            <SwitchRow label={t('admin.alcoholic')} value={c.alcoholic} onChange={c.setAlcoholic} />
            {!c.isNew && <SwitchRow label={t('admin.visible')} value={c.isActive} onChange={c.setIsActive} />}

            {!c.isNew && (
              <View className="mt-3 gap-2">
                <View className="flex-row items-center justify-between">
                  <Eyebrow>{t('admin.productsHere')}</Eyebrow>
                  <Button variant="ghost" icon="plus" label={t('admin.addProductHere')} onPress={c.addProduct} className="h-9 px-2" />
                </View>
                {c.products.length === 0 ? (
                  <Text className="font-body text-label text-muted">{t('admin.noProductsHere')}</Text>
                ) : (
                  c.products.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => c.openProduct(p.id)}
                      className={`flex-row items-center gap-3 rounded-md border border-border bg-card p-2 active:opacity-80 ${p.isActive ? '' : 'opacity-60'}`}
                    >
                      <View className="h-11 w-11 overflow-hidden rounded-sm bg-card-2">
                        <ProductImage src={p.image} name={localize(p.name)} size="tiny" />
                      </View>
                      <Text numberOfLines={1} className="flex-1 font-body-semibold text-body text-text">
                        {localize(p.name)}
                      </Text>
                      <Text className="font-body text-caption text-muted">{formatNpr(Math.min(...p.variants.map((v) => v.price)))}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <BottomBar>
        <Button label={c.isNew ? t('admin.create') : t('admin.save')} loading={c.saving} disabled={c.uploading} onPress={c.save} />
      </BottomBar>
    </Screen>
  );
}
