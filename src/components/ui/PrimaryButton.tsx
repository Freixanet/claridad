import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, spacing } from '@/design/tokens';
import { hapticLight } from '@/utils/haptics';

import { AppText } from './AppText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  style,
  fullWidth = true,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => {
        if (disabled) return;
        scale.value = withTiming(0.975, {
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
        await hapticLight();
        onPress?.();
      }}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <AppText variant="button">{label}</AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.accent.primary,
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: palette.accent.primaryDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
});
