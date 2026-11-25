import { Pressable, Text, View } from 'react-native';
import { Icon } from './Icon';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  size?: 'compact' | 'large';
};

/** − n + control, min 1, max stock (component inventory #3). */
export function QuantityStepper({ value, onChange, min = 1, max, size = 'compact' }: Props) {
  const large = size === 'large';
  const canDec = value > min;
  const canInc = value < max;
  const btn = large ? 'h-[34px] w-[34px] rounded-[11px]' : 'h-[27px] w-[27px] rounded-sm';

  const step = (delta: number) => onChange(Math.min(Math.max(value + delta, min), max));

  return (
    <View
      className={`flex-row items-center ${large ? 'gap-[15px] rounded-md bg-card p-1' : 'gap-[9px]'}`}
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: value }}
    >
      <Pressable
        accessibilityLabel="Decrease quantity"
        disabled={!canDec}
        onPress={() => step(-1)}
        hitSlop={6}
        className={`${btn} items-center justify-center border border-border bg-card-2 ${canDec ? '' : 'opacity-40'}`}
      >
        <Icon name="minus" size={large ? 18 : 15} />
      </Pressable>
      <Text className={`min-w-[16px] text-center font-heading text-text ${large ? 'text-[14px]' : 'text-[12px]'}`}>
        {value}
      </Text>
      <Pressable
        accessibilityLabel="Increase quantity"
        disabled={!canInc}
        onPress={() => step(1)}
        hitSlop={6}
        className={`${btn} items-center justify-center border border-border bg-card-2 ${canInc ? '' : 'opacity-40'}`}
      >
        <Icon name="plus" size={large ? 18 : 15} />
      </Pressable>
    </View>
  );
}
