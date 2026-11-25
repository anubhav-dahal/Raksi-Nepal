import Svg, { Circle, Path } from 'react-native-svg';
import { useColors } from '../theme';

// Icon set ported from the prototype (24x24, 1.9 stroke).
const icons = {
  menu: <Path d="M4 7h16M4 12h16M4 17h16" />,
  back: (
    <>
      <Path d="m15 18-6-6 6-6" />
      <Path d="M9 12h11" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  minus: <Path d="M5 12h14" />,
  check: <Path d="m5 12 4 4L19 6" />,
  close: <Path d="m6 6 12 12M18 6 6 18" />,
  bag: (
    <>
      <Path d="M6 8h12l1 13H5L6 8Z" />
      <Path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  home: (
    <>
      <Path d="m3 11 9-8 9 8" />
      <Path d="M5 10v11h14V10M9 21v-6h6v6" />
    </>
  ),
  arrow: <Path d="M7 17 17 7M8 7h9v9" />,
  trash: <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  alert: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 8v5M12 16.5v.5" />
    </>
  ),
  truck: (
    <>
      <Path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
      <Circle cx="7" cy="18" r="1.8" />
      <Circle cx="17" cy="18" r="1.8" />
    </>
  ),
  box: (
    <>
      <Path d="m3 7 9-4 9 4-9 4-9-4Z" />
      <Path d="M3 7v10l9 4 9-4V7M12 11v10" />
    </>
  ),
  logout: <Path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  refresh: <Path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
} as const;

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  size?: number;
  /** Defaults to the theme text colour. */
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color, strokeWidth = 1.9 }: Props) {
  const colors = useColors();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? colors.text}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </Svg>
  );
}
