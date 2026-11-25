import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { imageUrl } from '../../utils/image';
import { useColors } from '../theme';
import { Glow } from './Glow';

type Props = {
  src: string | undefined;
  /** Used for the placeholder initials. */
  name: string;
  /** cover for photos (categories), contain for product packshots. */
  fit?: 'cover' | 'contain';
  /** Placeholder size: tiny for list thumbnails (initials only). */
  size?: 'tiny' | 'small' | 'large';
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w[0] ?? ''))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

/**
 * Product / category picture that never shows an empty box: if there is no
 * image or it fails to load, a teal-glow monogram tile is shown instead.
 * Fills its parent (absolute).
 */
export function ProductImage({ src, name, fit = 'contain', size = 'small' }: Props) {
  const colors = useColors();
  const url = imageUrl(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);

  if (!url || failed) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-card-2">
        <Glow color={colors.accent} opacity={0.35} spread={0.75} />
        <Text className={`font-display text-accent ${size === 'large' ? 'text-[64px]' : size === 'tiny' ? 'text-[15px]' : 'text-[30px]'}`}>
          {initials(name)}
        </Text>
        {size !== 'tiny' && (
          <Text numberOfLines={1} className="mt-1 px-3 font-body-semibold text-micro uppercase tracking-[1px] text-muted">
            {name}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Image
      source={url}
      contentFit={fit}
      transition={200}
      onError={() => setFailed(true)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}
