import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../../models/stores/toastStore';
import { status } from '../theme';
import { Icon } from './Icon';

const DURATION_MS = 2400;

/** Floating message near the bottom (component inventory #11). Mounted once in the root layout. */
export function ToastHost() {
  const { message, kind, key, hide } = useToastStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, key, hide]);

  if (!message) return null;

  return (
    <Animated.View
      key={key}
      entering={FadeInDown.duration(300)}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="none"
      style={{ position: 'absolute', left: 17, right: 17, bottom: insets.bottom + 22 }}
    >
      <View accessibilityLiveRegion="polite" className="min-h-[51px] flex-row items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-2.5 shadow-card">
        <View
          className="h-[26px] w-[26px] items-center justify-center rounded-sm"
          style={{ backgroundColor: kind === 'error' ? status.error : status.success }}
        >
          <Icon name={kind === 'error' ? 'close' : 'check'} size={15} color={status.onAccent} strokeWidth={2.4} />
        </View>
        <Text className="flex-1 font-body-semibold text-label text-text">{message}</Text>
      </View>
    </Animated.View>
  );
}
