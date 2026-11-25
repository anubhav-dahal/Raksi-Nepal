import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useT } from '../../i18n';
import { Glow } from '../components/Glow';
import { Logo } from '../components/Logo';
import { palette } from '../theme';

// Timings from design/splash-animation-spec.md. Keep the two in sync.
export const SPLASH = {
  total: 2100,
  logoIn: 800,
  glowCycle: 2000,
  textDelay: 200,
  textIn: 400,
  loader: 1900,
  fadeOut: 200,
  reducedFade: 300,
} as const;

// The splash is always dark so it matches the native splash (spec, open question 2).
const c = palette.dark;

/** Animated splash shown over the app on cold start, then calls onDone. */
export function SplashView({ onDone, ready }: { onDone: () => void; ready: boolean }) {
  const t = useT();
  const reduced = useReducedMotion();

  const logo = useSharedValue(0);
  const glow = useSharedValue(0);
  const text = useSharedValue(0);
  const loader = useSharedValue(0);
  const screen = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      logo.value = withTiming(1, { duration: SPLASH.reducedFade });
      text.value = withTiming(1, { duration: SPLASH.reducedFade });
      loader.value = 1;
      return;
    }
    logo.value = withTiming(1, { duration: SPLASH.logoIn, easing: Easing.bezier(0.2, 1.4, 0.5, 1) });
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: SPLASH.glowCycle / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: SPLASH.glowCycle / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    text.value = withDelay(SPLASH.textDelay, withTiming(1, { duration: SPLASH.textIn, easing: Easing.out(Easing.ease) }));
    loader.value = withTiming(1, { duration: SPLASH.loader, easing: Easing.inOut(Easing.ease) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Leave once the timeline has played AND the app is ready (fonts, etc.).
  useEffect(() => {
    if (!ready) return;
    const wait = reduced ? SPLASH.reducedFade : SPLASH.total - SPLASH.fadeOut;
    const timer = setTimeout(() => {
      screen.value = withTiming(0, { duration: SPLASH.fadeOut }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, wait);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduced]);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screen.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logo.value,
    transform: reduced
      ? []
      : [{ translateY: (1 - logo.value) * 20 }, { scale: 0.7 + 0.3 * logo.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 1 - 0.3 * glow.value,
    transform: [{ scale: 1 + 0.12 * glow.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: text.value,
    transform: [{ translateY: (1 - text.value) * 8 }],
  }));
  const loaderStyle = useAnimatedStyle(() => ({ width: `${loader.value * 100}%` }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, screenStyle]} accessibilityLabel={t('appName')}>
      <Animated.View style={[styles.glow, glowStyle]}>
        <Glow color={c.accent} opacity={0.3} spread={0.68} />
      </Animated.View>
      <Animated.View style={logoStyle}>
        <Logo size={88} />
      </Animated.View>
      <Animated.View style={[styles.copy, textStyle]}>
        <Text style={styles.eyebrow}>{t('brand.top').toUpperCase()}</Text>
        <Text style={styles.wordmark}>{t('brand.bottom')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </Animated.View>
      <View style={styles.loaderTrack}>
        <Animated.View style={[styles.loaderFill, loaderStyle]} />
      </View>
      <Text style={styles.footer}>{t('location')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  glow: {
    position: 'absolute',
    width: 310,
    height: 310,
  },
  copy: { alignItems: 'center', marginTop: 12 },
  eyebrow: { color: c.accent, fontFamily: 'Manrope_800ExtraBold', fontSize: 10, letterSpacing: 3.2 },
  // Prototype .splash-copy h1: 43px, 0.2em spacing (the right margin balances the trailing letter space).
  wordmark: { color: c.text, fontFamily: 'Manrope_800ExtraBold', fontSize: 43, letterSpacing: 8.6, marginTop: 1, marginRight: -8.6 },
  tagline: { color: c.muted, fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: 4 },
  loaderTrack: {
    position: 'absolute',
    bottom: 65,
    width: 72,
    height: 2,
    borderRadius: 4,
    backgroundColor: c.card,
    overflow: 'hidden',
  },
  loaderFill: { height: '100%', backgroundColor: c.accent },
  footer: { position: 'absolute', bottom: 34, color: c.muted, fontSize: 9, letterSpacing: 0.9 },
});
