import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { styled } from 'nativewind';

/** Full-screen page with the app background and safe-area padding. */
export function Screen({ children, edges = ['top'] }: { children: ReactNode; edges?: ('top' | 'bottom')[] }) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-bg">
      {children}
    </SafeAreaView>
  );
}

/** Small uppercase accent label above headings. */
export function Eyebrow({ children }: { children: string }) {
  return <Text className="font-display text-caption tracking-[1.5px] text-accent">{children}</Text>;
}

export function Divider({ className = '' }: { className?: string }) {
  return <View className={`h-px bg-border ${className}`} />;
}

/**
 * 2-column grids: adds an empty cell when the count is odd so the last
 * card keeps half width. Render `null` items as <GridFiller />.
 */
export const padToEven = <T,>(items: T[] | undefined): (T | null)[] =>
  !items ? [] : items.length % 2 ? [...items, null] : items;

export function GridFiller() {
  return <View className="flex-1" />;
}

/** expo-image with className support. */
export const RemoteImage = styled(Image, { className: 'style' });
