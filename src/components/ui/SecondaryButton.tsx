import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { palette, radius, spacing } from '@/design/tokens';
import { hapticSelection } from '@/utils/haptics';

import { AppText } from './AppText';

type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function SecondaryButton({ label, onPress, style }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={async () => {
        await hapticSelection();
        onPress?.();
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    color: palette.text.secondary,
  },
});
