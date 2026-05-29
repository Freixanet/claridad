import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius } from '@/design/tokens';
import { hapticSelection } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FilterChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'premium';
};

export function FilterChip({
  label,
  active = false,
  onPress,
  variant = 'default',
}: FilterChipProps) {
  const progress = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(1);
  const premium = variant === 'premium';

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: motionDuration.fast,
      easing: motionEasing.standard,
    });
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      premium
        ? ['rgba(255,253,248,0)', palette.background.elevated]
        : ['rgba(91,79,214,0)', palette.accent.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      premium
        ? [palette.border.subtle, palette.border.warm]
        : [palette.border.strong, palette.accent.primary],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      premium
        ? [palette.text.secondary, palette.accent.primary]
        : [palette.text.secondary, palette.text.inverse],
    ),
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.94, { duration: motionDuration.instant });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, {
          duration: motionDuration.fast,
          easing: motionEasing.calm,
        });
      }}
      onPress={async () => {
        await hapticSelection();
        onPress?.();
      }}
      style={[styles.chip, premium && styles.premiumChip, animatedStyle]}
    >
      <Animated.Text style={[styles.label, premium && styles.premiumLabel, labelStyle]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  premiumChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  premiumLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
