import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motionDuration, motionEasing } from '@/design/motion';

type FadeInViewProps = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  /** Initial vertical offset in px (slide-up distance). */
  offsetY?: number;
  /** Adds a subtle scale-in for hero/emblem elements. */
  scaleIn?: boolean;
  /**
   * Opacity from which the fade starts (0–1).
   * Use > 0 for tab-switches to prevent the screen going nearly blank.
   */
  fromOpacity?: number;
  /** Override animation duration (ms). Defaults to motionDuration.normal. */
  duration?: number;
};

export function FadeInView({
  children,
  delay = 0,
  style,
  offsetY = 10,
  scaleIn = false,
  fromOpacity = 0,
  duration,
}: FadeInViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: duration ?? motionDuration.normal,
        easing: motionEasing.enter,
      }),
    );
  }, [delay, progress, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fromOpacity + progress.value * (1 - fromOpacity),
    transform: [
      { translateY: (1 - progress.value) * offsetY },
      { scale: scaleIn ? 0.94 + progress.value * 0.06 : 1 },
    ],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
