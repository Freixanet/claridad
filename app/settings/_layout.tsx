import { Stack } from 'expo-router';

import { palette } from '@/design/tokens';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background.dark },
      }}
    />
  );
}
