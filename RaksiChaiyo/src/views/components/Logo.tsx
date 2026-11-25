import { Image } from 'expo-image';

const logo = require('../../../assets/logo.png');

/** The Nepalgunj Sips logo (the beer-glass photo, rounded). */
export function Logo({ size = 88 }: { size?: number }) {
  return (
    <Image
      source={logo}
      accessibilityLabel="Nepalgunj Sips logo"
      style={{ width: size, height: size, borderRadius: size * 0.23 }}
      contentFit="cover"
    />
  );
}
