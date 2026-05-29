import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ReactNode } from 'react';
import { View } from 'react-native';

export default function FontLoader({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return <>{children}</>;
}
