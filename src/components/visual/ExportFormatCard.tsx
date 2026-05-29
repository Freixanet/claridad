import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { hapticSelection } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ExportFormatCardProps = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  badge?: string;
  onPress?: () => void;
};

/** Premium, standalone export option card — feels like a finished deliverable. */
export function ExportFormatCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  badge,
  onPress,
}: ExportFormatCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: motionDuration.instant });
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
      style={[styles.card, animatedStyle]}
    >
      <View style={[styles.iconTile, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={21} strokeWidth={2} />
      </View>
      <View style={styles.copy}>
        <AppText variant="h3" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="bodySmall" numberOfLines={2}>
          {description}
        </AppText>
      </View>
      <ChevronRight color={palette.text.tertiary} size={20} strokeWidth={2} />
      {badge ? (
        <View style={styles.badge}>
          <AppText variant="label" style={styles.badgeText}>
            {badge}
          </AppText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.background.elevated,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
    ...shadows.soft,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: palette.semantic.success,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: palette.semantic.successText,
    fontSize: 9,
  },
});
