import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { palette, radius, spacing } from '@/design/tokens';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
  tone?: 'light' | 'dark';
};

export function SettingsSection({ title, children, tone = 'dark' }: SettingsSectionProps) {
  const dark = tone === 'dark';
  return (
    <View style={styles.wrap}>
      <AppText
        variant="label"
        color={dark ? palette.text.onDarkMuted : palette.text.tertiary}
        style={styles.title}
      >
        {title}
      </AppText>
      <View
        style={[
          styles.card,
          {
            backgroundColor: dark ? palette.background.darkElevated : palette.background.elevated,
            borderColor: dark ? 'rgba(255,255,255,0.06)' : palette.border.warm,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    paddingHorizontal: spacing.xs,
  },
  card: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
