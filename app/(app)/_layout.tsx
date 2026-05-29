import { Stack } from 'expo-router';

import { palette } from '@/design/tokens';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background.ivory },
      }}
    />
  );
}
