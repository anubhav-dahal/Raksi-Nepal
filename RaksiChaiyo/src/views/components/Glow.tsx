import { useId } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

type Props = {
  color: string;
  /** Strength at the centre, 0..1. */
  opacity?: number;
  /** Where the glow fades out, as a fraction of the radius (0..1). */
  spread?: number;
  style?: StyleProp<ViewStyle>;
};

/** Soft radial light (the prototype's `radial-gradient` glows). Fills its box; put it behind content. */
export function Glow({ color, opacity = 0.18, spread = 0.7, style }: Props) {
  const id = `glow-${useId().replace(/:/g, '')}`;
  return (
    <Svg style={[{ position: 'absolute' }, style]} pointerEvents="none" width="100%" height="100%">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset={spread} stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
