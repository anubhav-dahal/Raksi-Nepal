import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../theme';
import { Glow } from './Glow';

type Edge = 'top' | 'bottom';

/**
 * Full-screen page: app background, the prototype's teal glow in the top-right
 * corner, and padding for the status bar / Android navigation bar.
 * Screens with their own <BottomBar> pass edges={['top']}.
 */
export function Screen({ children, edges = ['top', 'bottom'] }: { children: ReactNode; edges?: Edge[] }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  return (
    <View
      className="flex-1 overflow-hidden bg-bg"
      style={{
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
      }}
    >
      <Glow color={colors.accent} opacity={0.16} spread={0.6} style={{ width: 520, height: 520, top: -260, right: -230 }} />
      {children}
    </View>
  );
}

/**
 * Bar pinned to the bottom (Add to cart, Place order...). Sits above the
 * Android navigation / gesture bar, with side padding that can't be lost.
 */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="border-t border-border bg-bg px-gutter pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
      {children}
    </View>
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
