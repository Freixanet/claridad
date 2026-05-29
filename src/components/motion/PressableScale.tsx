import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motionDuration, motionEasing } from '@/design/motion';
import { hapticLight, hapticSelection } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HapticKind = 'none' | 'selection' | 'light';

type PressableScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Target scale while pressed. */
  scaleTo?: number;
  haptic?: HapticKind;
  disabled?: boolean;
} & Pick<PressableProps, 'accessibilityLabel' | 'accessibilityRole' | 'hitSlop'>;

/**
 * iOS-native press feedback: a calm, quick scale-down on press-in that springs
 * back on release. Replaces opacity-only feedback for primary touch targets.
 */
export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.97,
  haptic = 'selection',
  disabled = false,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(scaleTo, {
          duration: motionDuration.instant,
          easing: motionEasing.standard,
        });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, {
          duration: motionDuration.fast,
          easing: motionEasing.calm,
        });
      }}
      onPress={async () => {
        if (disabled) return;
        if (haptic === 'selection') await hapticSelection();
        else if (haptic === 'light') await hapticLight();
        onPress?.();
      }}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
