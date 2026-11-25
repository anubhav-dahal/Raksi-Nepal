import { ActivityIndicator, Pressable, Text } from 'react-native';
import { status, useColors } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const box: Record<Variant, string> = {
  primary: 'bg-accent active:bg-accent-dark',
  secondary: 'bg-card border border-border active:bg-card-2',
  ghost: 'bg-transparent active:opacity-60',
  danger: 'bg-error active:opacity-80',
};

const text: Record<Variant, string> = {
  primary: 'text-on-accent',
  secondary: 'text-text',
  ghost: 'text-accent',
  danger: 'text-on-accent',
};

/** Main call to action (component inventory #1). */
export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, className = '' }: Props) {
  const colors = useColors();
  const inactive = disabled || loading;
  const fg = variant === 'secondary' ? colors.text : variant === 'ghost' ? colors.accent : status.onAccent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      className={`h-control flex-row items-center justify-center gap-2 rounded-md px-5 ${box[variant]} ${
        inactive ? 'opacity-60' : ''
      } ${className}`}
      // Prototype .button--primary: soft teal glow under the main action.
      style={variant === 'primary' && !inactive ? { boxShadow: '0 12px 28px rgba(33,184,166,0.32)' } : undefined}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={19} color={fg} /> : null}
      <Text className={`font-heading text-body ${text[variant]}`}>{label}</Text>
    </Pressable>
  );
}
