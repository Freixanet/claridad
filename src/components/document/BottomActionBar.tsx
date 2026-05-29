import { Copy, MoreHorizontal, Share2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { hapticSelection } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ActionItem = {
  icon: React.ComponentType<{ color: string; size: number; strokeWidth: number }>;
  label: string;
  onPress?: () => void;
};

type BottomActionBarProps = {
  onCopy?: () => void;
  onExport?: () => void;
  onMore?: () => void;
  variant?: 'default' | 'premium';
};

function ActionButton({ action, premium }: { action: ActionItem; premium: boolean }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      key={action.label}
      onPressIn={() => {
        scale.value = withTiming(0.91, { duration: motionDuration.instant });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, {
          duration: motionDuration.fast,
          easing: motionEasing.calm,
        });
      }}
      onPress={async () => {
        await hapticSelection();
        action.onPress?.();
      }}
      style={[styles.action, premium && styles.premiumAction, animStyle]}
    >
      <action.icon
        color={premium ? palette.text.primary : palette.text.secondary}
        size={20}
        strokeWidth={1.75}
      />
      <AppText variant="caption" style={[styles.label, premium && styles.premiumLabel]}>
        {action.label}
      </AppText>
    </AnimatedPressable>
  );
}

export function BottomActionBar({
  onCopy,
  onExport,
  onMore,
  variant = 'default',
}: BottomActionBarProps) {
  const insets = useSafeAreaInsets();
  const premium = variant === 'premium';

  const actions: ActionItem[] = [
    { icon: Copy, label: 'Copiar', onPress: onCopy },
    { icon: Share2, label: 'Exportar', onPress: onExport },
    { icon: MoreHorizontal, label: 'Más', onPress: onMore },
  ];

  return (
    <View
      style={[
        styles.bar,
        premium && styles.premiumBar,
        { paddingBottom: insets.bottom + spacing.xs },
      ]}
    >
      {actions.map((action) => (
        <ActionButton key={action.label} action={action} premium={premium} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: palette.background.elevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border.subtle,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    ...shadows.card,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  label: {
    color: palette.text.secondary,
  },
  premiumBar: {
    backgroundColor: '#FFFDF8',
    borderTopColor: palette.border.warm,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  premiumAction: {
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  premiumLabel: {
    color: palette.text.secondary,
    fontSize: 12,
  },
});
