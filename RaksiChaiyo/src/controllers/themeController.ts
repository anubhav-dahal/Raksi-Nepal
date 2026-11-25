import { useEffect } from 'react';
import { Appearance, Platform } from 'react-native';
import { colorScheme } from 'react-native-css';
import { usePrefsStore } from '../models/stores/prefsStore';

/**
 * Applies the theme preference to the whole app: React Native's colour scheme
 * (useColorScheme, StatusBar) and the CSS variables in global.css.
 * The web preview always follows the browser.
 */
export const useApplyTheme = () => {
  const theme = usePrefsStore((s) => s.theme);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(theme === 'system' ? 'auto' : theme);
    colorScheme.set(theme === 'system' ? null : theme);
  }, [theme]);
};
