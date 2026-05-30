import 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setupMockApi } from '@/api/setupMockApi';
import FontLoader from '@/components/FontLoader';
import MobilePreviewFrame from '@/components/MobilePreviewFrame';
import { CaptureFlowProvider } from '@/context/CaptureFlowContext';

setupMockApi();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <FontLoader>
          <CaptureFlowProvider>
            <MobilePreviewFrame>
              <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#FFFFFF' },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="capture"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen name="processing" options={{ animation: 'fade' }} />
                  <Stack.Screen name="document/[id]" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen
                    name="review/[id]"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="export/[id]"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                </Stack>
              </GestureHandlerRootView>
            </MobilePreviewFrame>
          </CaptureFlowProvider>
        </FontLoader>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
