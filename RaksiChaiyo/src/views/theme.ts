import { useColorScheme } from 'react-native';

// JS copy of the colour tokens in global.css, for places that can't use
// className (SVG stroke/fill, StatusBar, navigation background).
// Keep in sync with global.css.
export const palette = {
  dark: {
    bg: '#0b132b',
    card: '#1c2541',
    card2: '#233055',
    text: '#f8f9fa',
    muted: '#8d99ae',
    accent: '#21b8a6',
    accentDark: '#087f73',
  },
  light: {
    bg: '#f7f9fa',
    card: '#ffffff',
    card2: '#edf3f3',
    text: '#18252d',
    muted: '#687981',
    accent: '#087f73',
    accentDark: '#06695f',
  },
} as const;

export const status = {
  success: '#2ec4b6',
  warning: '#ff8800',
  error: '#e63946',
  onAccent: '#ffffff',
} as const;

export type Colors = (typeof palette)['dark'] | (typeof palette)['light'];

export const useColors = (): Colors => (useColorScheme() === 'light' ? palette.light : palette.dark);
