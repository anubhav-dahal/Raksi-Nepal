import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAccountController } from '../../controllers/orderControllers';
import { useT } from '../../i18n';
import { usePrefsStore } from '../../models/stores/prefsStore';
import { formatNpr } from '../../utils/format';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { Divider, Eyebrow, Screen } from '../components/Layout';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { EmptyState, ErrorState, Skeleton } from '../components/StateView';

export function AccountScreen() {
  const t = useT();
  const c = useAccountController();
  const language = usePrefsStore((s) => s.language);
  const setLanguage = usePrefsStore((s) => s.setLanguage);

  if (!c.isLoggedIn) {
    return (
      <Screen>
        <AppHeader title={t('account.title')} />
        <EmptyState icon="user" title={t('account.guest')} hint={t('account.guestHint')} />
        <View className="gap-2 px-gutter pb-8">
          <Button label={t('auth.login')} onPress={c.login} />
          <Button variant="secondary" label={t('auth.register')} onPress={c.register} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title={t('account.title')} />
      <ScrollView contentContainerClassName="gap-3 px-gutter pb-10 pt-2">
        <View className="gap-1 rounded-lg border border-border bg-card p-4">
          <Text className="font-display text-title text-text">{c.user?.name}</Text>
          <Text className="font-body text-label text-muted">{c.user?.phone}</Text>
          {c.user?.role !== 'customer' && (
            <Text className="font-body-bold text-caption uppercase text-accent">{c.user?.role}</Text>
          )}
          <Divider className="my-2" />
          <View className="flex-row items-center justify-between">
            <Text className="font-body text-label text-muted">{t('account.language')}</Text>
            <View className="flex-row gap-2">
              {(['en', 'ne'] as const).map((lang) => (
                <Pressable
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  className={`rounded-pill border px-3 py-1.5 ${language === lang ? 'border-accent bg-accent/10' : 'border-border'}`}
                >
                  <Text className={`font-body-bold text-caption ${language === lang ? 'text-accent' : 'text-text'}`}>
                    {lang === 'en' ? 'English' : 'नेपाली'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {c.user?.role === 'admin' && (
          <Button icon="box" label={t('staff.adminDashboard')} onPress={() => router.push('/admin')} />
        )}
        {c.user?.role === 'rider' && (
          <Button icon="truck" label={t('staff.riderDeliveries')} onPress={() => router.push('/rider')} />
        )}

        <View className="mt-2">
          <Eyebrow>{t('account.orders')}</Eyebrow>
        </View>
        {c.orders.error && !c.orders.data ? (
          <ErrorState error={c.orders.error} onRetry={c.orders.reload} />
        ) : !c.orders.data ? (
          <Skeleton className="h-20" />
        ) : c.orders.data.length === 0 ? (
          <Text className="font-body text-body text-muted">{t('account.noOrders')}</Text>
        ) : (
          c.orders.data.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => c.openOrder(order.id)}
              className="gap-1.5 rounded-lg border border-border bg-card p-3.5 active:opacity-80"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-heading text-body text-text">{order.orderNumber}</Text>
                <OrderStatusBadge status={order.status} />
              </View>
              <Text className="font-body text-caption text-muted">
                {new Date(order.createdAt).toLocaleString()} · {formatNpr(order.total)}
              </Text>
            </Pressable>
          ))
        )}

        <Button variant="secondary" icon="logout" label={t('account.logout')} onPress={c.logout} className="mt-4" />
      </ScrollView>
    </Screen>
  );
}
