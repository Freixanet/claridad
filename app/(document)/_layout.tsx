import { Stack } from 'expo-router';

import { palette } from '@/design/tokens';

export default function DocumentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: palette.background.ivory },
      }}
    >
      <Stack.Screen name="export" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
