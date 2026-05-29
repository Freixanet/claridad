import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motionDuration, motionEasing } from '@/design/motion';
import { palette, spacing } from '@/design/tokens';

type OnboardingDotsProps = {
  total: number;
  current: number;
};

function Dot({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: motionDuration.normal,
      easing: motionEasing.calm,
    });
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    width: 6 + progress.value * 14,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [palette.border.strong, palette.accent.primary],
    ),
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function OnboardingDots({ total, current }: OnboardingDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 4,
  },
});
