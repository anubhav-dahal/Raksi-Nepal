import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  /** "glass" sits on top of photos. */
  variant?: 'solid' | 'glass';
  /** Small badge (cart count). Hidden when 0. */
  count?: number;
};

/** Square 40px icon button (component inventory #2). */
export function IconButton({ icon, onPress, accessibilityLabel, variant = 'solid', count = 0 }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      className={`h-10 w-10 items-center justify-center rounded-md active:scale-95 ${
        variant === 'glass' ? 'border border-white/20 bg-black/45' : 'bg-card'
      }`}
    >
      <Icon name={icon} size={21} color={variant === 'glass' ? '#ffffff' : undefined} />
      {count > 0 && (
        <View className="absolute -right-1 -top-1 h-[18px] min-w-[18px] items-center justify-center rounded-pill border-2 border-bg bg-accent px-1">
          <Text className="font-body-bold text-micro text-on-accent">{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}
