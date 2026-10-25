# Splash Animation Spec

**Issue:** #22 · **Phase:** 1 Design · **Status:** Draft, needs agreement from both of us
**Builds in:** Phase 3, "Animated splash screen"
**Based on:** the "Animation screen" frame in `design/app-design.excalidraw` and the splash in `Prototype/`

## 1. Goal

Show the brand for about two seconds while the app gets ready, then hand over to Home with no flicker or white flash on Android.

## 2. Two stages

| Stage | What it is | How long |
| :-- | :-- | :-- |
| **Native splash** | Static image the OS shows before JS loads (`expo-splash-screen`). Midnight Navy `#0b132b` background with the logo centred. | Until JS and fonts are ready |
| **Animated splash** | React Native screen that plays the motion below. Its first frame matches the native splash exactly, so the swap can't be seen. | **2100 ms** total |

The native splash is hidden only after the animated screen has drawn its first frame.

## 3. Layout (top to bottom, all centred)

1. **Glow:** soft 310 × 310 px teal circle behind the logo (`accent` at 18% opacity, fading to transparent at 68%).
2. **Logo:** glass mark, 88 px wide.
3. **Eyebrow:** app name line 1, `font-display`, 10 px, letter spacing 0.32em, `accent` colour.
4. **Wordmark:** app name line 2, `font-display`, 43 px, letter spacing 0.2em, `text` colour.
5. **Tagline:** "Drinks, snacks & good moments", `font-body`, 11 px, `muted`.
6. **Loader bar:** 72 × 2 px, 65 px from the bottom, track is `card`, fill is `accent`.
7. **Footer:** "Nepalgunj, Nepal", 9 px, `muted`, 34 px from the bottom.

Background is `bg`. Colours and fonts are the tokens from #21.

## 4. Timeline

| Time (ms) | Element | Motion | Easing |
| :-- | :-- | :-- | :-- |
| 0 to 800 | Logo | From `translateY: 20, scale: 0.7, opacity: 0` to rest | Spring overshoot, `cubic-bezier(0.2, 1.4, 0.5, 1)` |
| 0 to 2000, loops | Glow | "Breathe": scale 1 → 1.12 → 1, opacity 1 → 0.7 → 1 | `ease-in-out` |
| 200 to 600 | Eyebrow, wordmark, tagline | Fade in, rise 8 px | `ease-out` |
| 0 to 1900 | Loader fill | Width 0% → 100% | `ease-in-out` |
| 1900 to 2100 | Whole screen | Fade out over 200 ms while Home fades in | `ease` |

At **2100 ms** the app moves to Home. It can wait longer only if something it needs (fonts, first API call) is still loading. In that case the loader stays full and the glow keeps breathing. After **6 s** it goes to Home anyway, and Home shows its own loading state.

## 5. Rules

- **Reduced motion:** if the device has "Remove animations" on (`AccessibilityInfo.isReduceMotionEnabled`), skip the scale and spring and do one 300 ms fade.
- **No tapping to skip** in the MVP. The splash is short enough.
- **Shown once per cold start.** Coming back from the background does not show it again.
- **Performance:** animate only `transform` and `opacity` with Reanimated (already installed) so it runs on the UI thread. No layout animation.
- **Status bar:** light content on the navy background.

## 6. Implementation notes (Phase 3)

- New packages needed: `npx expo install expo-splash-screen react-native-svg`.
- `expo-splash-screen`: call `preventAutoHideAsync()` at startup and `hideAsync()` once the animated screen's first frame is drawn. Set its background and image in `app.json` (`#0b132b` with the logo) so stage 1 matches stage 2.
- The logo is the SVG from `Prototype/src/App.tsx` (`Logo`). Export it as a PNG for the native splash and use `react-native-svg` for the animated one.
- Use `withTiming` for the timed steps and `withRepeat` for the glow. Put all durations in one `SPLASH` constant so the spec and the code stay matched.

## 7. Open questions (settle in the design review, #24)

1. **Brand name.** The prototype says "NEPALGUNJ / SIPS" but the app is called **RaksiChaiyo**. Which text goes on the splash?
2. **Theme.** Should the splash always be dark (navy), even when the phone is in light mode? Recommendation: yes, always dark, so it matches the native splash.
3. **Age notice.** Should "18+ · Enjoy responsibly" go on the splash, or stay on the category cards and the age modal?

## 8. Sign-off

- [ ] @aakash-develops agrees
- [ ] @anubhav-dahal agrees
