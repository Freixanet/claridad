import { BlurView } from 'expo-blur';
import { Camera } from 'lucide-react-native';
import { type RefObject } from 'react';
import { Platform, Pressable, StyleSheet, View, type View as RNView } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CLARIDAD_SPRING } from '@/motion/config';

const FAB_SIZE = 64;
const FAB_RADIUS = 32;

const springConfig = {
  ...CLARIDAD_SPRING,
  reduceMotion: ReduceMotion.System,
};

type Props = {
  onPress: () => void;
  blurTargetRef?: RefObject<RNView | null>;
};

export default function CaptureFab({ onPress, blurTargetRef }: Props) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + 24 }, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Capture note"
      >
        <View style={[styles.fab, styles.shadow]}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {Platform.OS === 'web' ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  styles.webGlassBase,
                  {
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  } as object,
                ]}
              />
            ) : (
              <>
                <BlurView
                  blurTarget={blurTargetRef}
                  blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
                  intensity={45}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.navyOverlay} />
              </>
            )}
          </View>
          <View pointerEvents="none" style={styles.iconLayer}>
            <Camera color="#FFFFFF" size={26} strokeWidth={2} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  shadow: {
    shadowColor: '#1C1E2A',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(28, 30, 46, 0.85)',
  },
  navyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 30, 46, 0.55)',
  },
  webGlassBase: {
    backgroundColor: 'rgba(28, 30, 46, 0.65)',
  },
  iconLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
