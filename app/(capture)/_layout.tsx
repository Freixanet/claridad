import { Stack } from 'expo-router';

import { palette } from '@/design/tokens';

export default function CaptureLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}

// Dark tone for capture flow screens
export const captureScreenOptions = {
  contentStyle: { backgroundColor: palette.background.dark },
};
