import { Pressable, Text } from 'react-native';

/** Small selectable pill for filters and choices. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-pill border px-3.5 py-2 ${selected ? 'border-accent bg-accent/10' : 'border-border bg-card'}`}
    >
      <Text className={`font-body-bold text-caption ${selected ? 'text-accent' : 'text-text'}`}>{label}</Text>
    </Pressable>
  );
}
