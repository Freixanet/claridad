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
};

function ActionButton({ action }: { action: ActionItem }) {
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
      style={[styles.action, animStyle]}
    >
      <action.icon color={palette.text.secondary} size={20} strokeWidth={1.75} />
      <AppText variant="caption" style={styles.label}>
        {action.label}
      </AppText>
    </AnimatedPressable>
  );
}

export function BottomActionBar({ onCopy, onExport, onMore }: BottomActionBarProps) {
  const insets = useSafeAreaInsets();

  const actions: ActionItem[] = [
    { icon: Copy, label: 'Copiar', onPress: onCopy },
    { icon: Share2, label: 'Exportar', onPress: onExport },
    { icon: MoreHorizontal, label: 'Más', onPress: onMore },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.xs }]}>
      {actions.map((action) => (
        <ActionButton key={action.label} action={action} />
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
});
