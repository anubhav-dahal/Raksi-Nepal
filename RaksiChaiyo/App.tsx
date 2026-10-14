import './global.css';

import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
      <Text className="text-2xl font-bold text-amber-600">RaksiChaiyo</Text>
      <Text className="mt-2 text-neutral-500">NativeWind + Tailwind is working</Text>
      <StatusBar style="auto" />
    </View>
  );
}
