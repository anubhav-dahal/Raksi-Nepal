import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useCartCount } from '../../controllers/cartController';
import { useT } from '../../i18n';
import { IconButton } from './IconButton';
import { Logo } from './Logo';

type Props = {
  /** No title and no `back` = home header with the logo. */
  title?: string;
  /** Show the back button (on by default when there is a title). */
  back?: boolean;
  /** Hide the cart button (e.g. on the cart screen itself). */
  showCart?: boolean;
  /** Extra button(s) left of the cart. */
  right?: ReactNode;
  onBack?: () => void;
};

/** Top bar (component inventory #12). */
export function AppHeader({ title, back = title !== undefined, showCart = true, right, onBack }: Props) {
  const t = useT();
  const count = useCartCount();

  return (
    <View className="flex-row items-center gap-3 px-gutter pb-2 pt-2">
      {back ? (
        <>
          <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={onBack ?? (() => router.back())} />
          <Text numberOfLines={1} className="flex-1 font-heading text-title text-text">
            {title ?? ''}
          </Text>
        </>
      ) : (
        <View className="flex-1 flex-row items-center gap-2">
          <Logo size={37} />
          <Text className="font-display text-title text-text">{t('appName')}</Text>
        </View>
      )}
      <View className="flex-row gap-2">
        {right}
        {showCart && (
          <IconButton
            icon="bag"
            count={count}
            accessibilityLabel={t('cart.label', { count })}
            onPress={() => router.push('/cart')}
          />
        )}
      </View>
    </View>
  );
}
