import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { AppText } from '@/components/ui';
import { palette, spacing } from '@/design/tokens';

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  tone?: 'light' | 'dark';
  last?: boolean;
};

export function SettingsRow({
  label,
  value,
  onPress,
  destructive = false,
  tone = 'dark',
  last = false,
}: SettingsRowProps) {
  const dark = tone === 'dark';
  const labelColor = destructive
    ? palette.semantic.dangerText
    : dark
      ? palette.text.onDark
      : palette.text.primary;
  const valueColor = dark ? palette.text.onDarkMuted : palette.text.secondary;
  const borderColor = dark ? 'rgba(255,255,255,0.07)' : palette.border.warm;
  const chevronColor = dark ? palette.text.onDarkMuted : palette.text.tertiary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        pressed && onPress && styles.pressed,
      ]}
    >
      <AppText variant="body" color={labelColor}>
        {label}
      </AppText>
      <View style={styles.trailing}>
        {value ? (
          <AppText variant="bodySmall" color={valueColor}>
            {value}
          </AppText>
        ) : null}
        {onPress ? <ChevronRight color={chevronColor} size={17} strokeWidth={2} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  pressed: {
    opacity: 0.6,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
