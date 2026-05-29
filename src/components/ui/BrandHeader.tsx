import { StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';

import { palette, spacing } from '@/design/tokens';

import { AppText } from './AppText';

type BrandHeaderProps = {
  subtitle?: string;
  compact?: boolean;
};

export function BrandHeader({ subtitle, compact = false }: BrandHeaderProps) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.mark}>
        <Sparkles color={palette.accent.primary} size={18} strokeWidth={2} />
      </View>
      <View>
        <AppText variant={compact ? 'h3' : 'h2'}>Claridad</AppText>
        {subtitle ? (
          <AppText variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  compact: {
    marginBottom: spacing.md,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 2,
  },
});
