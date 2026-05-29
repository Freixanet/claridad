import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { layout, palette, radius } from '@/design/tokens';
import { hapticSelection } from '@/utils/haptics';

type IconButtonProps = {
  icon: LucideIcon;
  onPress?: () => void;
  accessibilityLabel: string;
  tone?: 'light' | 'dark';
  style?: ViewStyle;
};

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  tone = 'light',
  style,
}: IconButtonProps) {
  const isDark = tone === 'dark';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={async () => {
        await hapticSelection();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        isDark ? styles.dark : styles.light,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon
        color={isDark ? palette.text.onDark : palette.text.primary}
        size={22}
        strokeWidth={1.75}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  light: {
    backgroundColor: palette.background.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.subtle,
  },
  dark: {
    backgroundColor: palette.background.darkElevated,
  },
  pressed: {
    opacity: 0.88,
  },
});
