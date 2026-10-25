import './global.css';

// Per-weight imports so only the weights we use are bundled.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-gutter">
      <Text className="font-display text-hero text-text">RaksiChaiyo</Text>
      <Text className="font-body text-body text-muted">Theme tokens are working</Text>
      <View className="flex-row gap-2">
        <View className="h-control w-control rounded-md bg-accent" />
        <View className="h-control w-control rounded-md bg-card border border-border" />
        <View className="h-control w-control rounded-md bg-card-2" />
      </View>
      <View className="flex-row gap-2">
        <Text className="rounded-pill bg-success px-3 py-1 font-body-bold text-caption text-on-accent">In stock</Text>
        <Text className="rounded-pill bg-warning px-3 py-1 font-body-bold text-caption text-on-accent">Low stock</Text>
        <Text className="rounded-pill bg-error px-3 py-1 font-body-bold text-caption text-on-accent">Error</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
