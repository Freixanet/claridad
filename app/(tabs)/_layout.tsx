import { Tabs, useRouter } from 'expo-router';
import { Library, Settings, Camera } from 'lucide-react-native';
import { Pressable, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.borderGhost,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'ios' ? 24 : 6,
        },
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          lineHeight: 14,
          letterSpacing: -0.1,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Library color={color} size={size - 2} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="capture-tab"
        options={{
          title: 'Capture',
          tabBarIcon: () => (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.foreground,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -8,
              }}
            >
              <Camera color="#FFFFFF" size={20} strokeWidth={2.2} />
            </View>
          ),
          tabBarLabel: () => null,
          tabBarButton: ({ ref: _ref, onPress: _onPress, href: _href, ...props }) => (
            <Pressable
              {...props}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                }
                router.push('/capture');
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size - 2} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
