import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useT } from '../../i18n';
import { useColors } from '../theme';

type Props = Omit<TextInputProps, 'onChangeText' | 'value' | 'secureTextEntry'> & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'phone' | 'password' | 'email';
  error?: string;
  hint?: string;
};

/** Labelled text field with error message (component inventory #5). */
export function Input({ label, value, onChangeText, type = 'text', error, hint, ...rest }: Props) {
  const t = useT();
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const typeProps: TextInputProps =
    type === 'phone'
      ? { keyboardType: 'number-pad', maxLength: 10, autoComplete: 'tel', textContentType: 'telephoneNumber' }
      : type === 'email'
        ? { keyboardType: 'email-address', autoCapitalize: 'none', autoComplete: 'email' }
        : type === 'password'
          ? { secureTextEntry: !revealed, autoCapitalize: 'none', autoComplete: 'password' }
          : {};

  const border = error ? 'border-error' : focused ? 'border-accent' : 'border-border';

  return (
    <View className="gap-1.5">
      <Text className="font-body-bold text-caption text-muted">{label}</Text>
      <View className={`h-control flex-row items-center rounded-md border bg-card px-4 ${border}`}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.muted}
          className="h-full flex-1 font-body text-body text-text"
          {...typeProps}
          {...rest}
        />
        {type === 'password' && (
          <Pressable onPress={() => setRevealed((r) => !r)} hitSlop={8}>
            <Text className="font-body-bold text-caption text-accent">{revealed ? t('auth.hide') : t('auth.show')}</Text>
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="font-body text-caption text-error">{error}</Text>
      ) : hint ? (
        <Text className="font-body text-caption text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
