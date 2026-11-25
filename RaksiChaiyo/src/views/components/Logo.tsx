import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

// Glass-and-orbit mark from the prototype. Fixed brand colours (not themed).
export function Logo({ size = 88 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 76 76" accessibilityLabel="Nepalgunj Sips logo">
      <Defs>
        <LinearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#79eadc" stopOpacity={0.95} />
          <Stop offset="1" stopColor="#21b8a6" stopOpacity={0.45} />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 39C16 20 29 10 46 12c16 2 24 16 17 31-7 16-25 23-40 15"
        fill="none"
        stroke="#21b8a6"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path fill="url(#glass)" d="M23 27h34l-4 31a6 6 0 0 1-6 5H33a6 6 0 0 1-6-5l-4-31Z" />
      <Path fill="none" stroke="#e7fffb" strokeWidth={3.2} strokeLinecap="round" d="m47 29 8-18" />
      <Path
        fill="#f5f7fa"
        fillOpacity={0.62}
        d="M29 35c7 4 14-4 22 0l-3 21c-.2 1.2-1.1 2-2.3 2H34.3c-1.2 0-2.1-.8-2.3-2l-3-21Z"
      />
      <Circle cx="50" cy="49" r="3.5" fill="#21b8a6" />
    </Svg>
  );
}
