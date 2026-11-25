import { router } from 'expo-router';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useHomeController } from '../../controllers/catalogueControllers';
import { useT } from '../../i18n';
import { AgeGateModal } from '../components/AgeGateModal';
import { AppHeader } from '../components/AppHeader';
import { Pill } from '../components/Badge';
import { CategoryCard } from '../components/Cards';
import { IconButton } from '../components/IconButton';
import { Eyebrow, GridFiller, padToEven, Screen } from '../components/Layout';
import { EmptyState, ErrorState, Skeleton } from '../components/StateView';
import { useColors } from '../theme';

export function HomeScreen() {
  const t = useT();
  const colors = useColors();
  const { categories, openCategory, ageGate } = useHomeController();

  // Prototype .hero-copy: eyebrow + big headline, delivery-time pill on the right.
  const header = (
    <View className="mb-[22px] mt-2 flex-row items-end justify-between px-0.5">
      <View className="flex-1 gap-2">
        <Eyebrow>{t('home.eyebrow')}</Eyebrow>
        <Text className="font-display text-hero leading-[33px] tracking-[-1px] text-text">{t('home.title')}</Text>
      </View>
      <Pill label={t('home.deliveryPill')} />
    </View>
  );

  let body;
  if (categories.loading && !categories.data) {
    body = (
      <View className="px-gutter">
        {header}
        {[0, 1].map((row) => (
          <View key={row} className="mb-3 flex-row gap-3">
            <Skeleton className="h-[230px] flex-1" />
            <Skeleton className="h-[230px] flex-1" />
          </View>
        ))}
      </View>
    );
  } else if (categories.error && !categories.data) {
    body = <ErrorState error={categories.error} onRetry={categories.reload} />;
  } else {
    body = (
      <FlatList
        data={padToEven(categories.data)}
        keyExtractor={(c) => c?.id ?? 'filler'}
        numColumns={2}
        columnWrapperClassName="gap-3"
        contentContainerClassName="gap-3 px-gutter pb-8"
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState title={t('home.empty')} />}
        ListFooterComponent={
          <Text className="mx-5 mt-4 text-center font-body text-caption leading-[16px] text-muted">{t('home.responsible')}</Text>
        }
        renderItem={({ item, index }) =>
          item ? <CategoryCard category={item} index={index} onPress={() => openCategory(item)} /> : <GridFiller />
        }
        refreshControl={<RefreshControl refreshing={false} onRefresh={categories.reload} tintColor={colors.accent} />}
      />
    );
  }

  return (
    <Screen>
      <AppHeader
        right={<IconButton icon="user" accessibilityLabel={t('account.title')} onPress={() => router.push('/account')} />}
      />
      {body}
      <AgeGateModal visible={ageGate.visible} onConfirm={ageGate.confirm} onDecline={ageGate.decline} />
    </Screen>
  );
}
