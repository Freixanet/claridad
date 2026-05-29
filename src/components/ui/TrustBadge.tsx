import { ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '@/design/tokens';

import { AppText } from './AppText';

type TrustBadgeProps = {
  message: string;
};

export function TrustBadge({ message }: TrustBadgeProps) {
  return (
    <View style={styles.wrap}>
      <ShieldCheck color={palette.accent.primary} size={16} strokeWidth={2} />
      <AppText variant="trust">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.background.paper,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.subtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
