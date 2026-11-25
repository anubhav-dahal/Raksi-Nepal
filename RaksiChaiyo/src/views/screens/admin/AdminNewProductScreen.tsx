import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { useNewProduct } from '../../../controllers/catalogueAdminControllers';
import { useT } from '../../../i18n';
import { localize } from '../../../utils/format';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { PhotoField } from '../../components/FormBits';
import { Icon } from '../../components/Icon';
import { Input } from '../../components/Input';
import { BottomBar, Eyebrow, Screen } from '../../components/Layout';
import { status } from '../../theme';

/** Create a product: category, photo, name, description, one or more sizes. */
export function AdminNewProductScreen({ categoryId }: { categoryId?: string }) {
  const t = useT();
  const c = useNewProduct(categoryId);

  return (
    <Screen edges={['top']}>
      <AppHeader title={t('admin.newProduct')} showCart={false} />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerClassName="gap-3 px-gutter pb-6 pt-1" keyboardShouldPersistTaps="handled">
          <Text className="font-body-bold text-caption text-muted">{t('admin.category')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {(c.categories.data ?? []).map((cat) => (
              <Chip key={cat.id} label={localize(cat.name)} selected={c.categoryId === cat.id} onPress={() => c.setCategoryId(cat.id)} />
            ))}
          </View>

          <PhotoField image={c.image} name={c.name} uploading={c.uploading} onPress={c.changePhoto} />
          <Input label={t('admin.name')} value={c.name} onChangeText={c.setName} placeholder="Gorkha Premium" />
          <Input label={t('admin.description')} value={c.description} onChangeText={c.setDescription} multiline />

          <View className="mt-2">
            <Eyebrow>{t('admin.sizes')}</Eyebrow>
          </View>
          {c.sizes.map((row, i) => (
            <View key={i} className="gap-2 rounded-lg border border-border bg-card p-3">
              <View className="flex-row items-start gap-2">
                <View className="flex-1">
                  <Input label={t('admin.sizeLabel')} value={row.label} onChangeText={(v) => c.updateSize(i, 'label', v)} placeholder="650 ml bottle" />
                </View>
                {c.sizes.length > 1 && (
                  <Pressable onPress={() => c.removeSize(i)} hitSlop={8} className="mt-7 p-2" accessibilityLabel="Remove size">
                    <Icon name="trash" size={18} color={status.error} />
                  </Pressable>
                )}
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input label={t('admin.sizePrice')} value={row.price} onChangeText={(v) => c.updateSize(i, 'price', v)} keyboardType="number-pad" placeholder="340" />
                </View>
                <View className="flex-1">
                  <Input label={t('admin.sizeStock')} value={row.stock} onChangeText={(v) => c.updateSize(i, 'stock', v)} keyboardType="number-pad" placeholder="24" />
                </View>
              </View>
            </View>
          ))}
          <Button variant="ghost" icon="plus" label={t('admin.addSize')} onPress={c.addSize} className="self-start" />
          {c.error && <Text className="font-body-semibold text-label text-error">{c.error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomBar>
        <Button label={t('admin.create')} loading={c.saving} disabled={c.uploading} onPress={c.save} />
      </BottomBar>
    </Screen>
  );
}
