import { Alert } from 'react-native';

/** Native "are you sure?" dialog for destructive actions. */
export const confirmDestructive = (title: string, message: string, confirmLabel: string, keepLabel: string, onConfirm: () => void) =>
  Alert.alert(title, message, [
    { text: keepLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
