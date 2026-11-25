import { Pressable, Text, View } from 'react-native';
import { status } from '../theme';
import { Icon } from './Icon';

type Props = {
  title: string;
  note: string;
  /** Short text in the icon tile, e.g. "रु" or "e". */
  mark: string;
  markColor?: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** Choose-one payment card (component inventory #10). */
export function PaymentOption({ title, note, mark, markColor, selected, disabled, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-lg border p-3.5 ${
        selected ? 'border-accent bg-accent/10' : 'border-border bg-card'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: markColor ?? '#21b8a6' }}>
        <Text className="font-display text-title text-on-accent">{mark}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-heading text-body text-text">{title}</Text>
        <Text className="font-body text-caption text-muted">{note}</Text>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-pill border-2 ${selected ? 'border-accent bg-accent' : 'border-border'}`}
      >
        {selected && <Icon name="check" size={14} color={status.onAccent} strokeWidth={2.6} />}
      </View>
    </Pressable>
  );
}
