import '../../global.css';

// Per-weight imports so only the weights we use are bundled.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastHost } from '../views/components/ToastHost';
import { SplashView } from '../views/screens/SplashView';
import { useColors } from '../views/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useColors();
  const scheme = useColorScheme();
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const ready = fontsLoaded || !!fontError;

  // The animated splash is drawn under the native one, so hiding the
  // native splash right away swaps them with no visible change.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {ready && (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          />
        )}
        <ToastHost />
        {!splashDone && <SplashView ready={ready} onDone={() => setSplashDone(true)} />}
        <StatusBar style={!splashDone || scheme !== 'light' ? 'light' : 'dark'} />
      </View>
    </SafeAreaProvider>
  );
}
