import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { AppText } from '@/components/ui';
import { palette, spacing } from '@/design/tokens';
import { hapticSelection } from '@/utils/haptics';

type ExportOptionRowProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
};

export function ExportOptionRow({
  icon: Icon,
  title,
  description,
  onPress,
}: ExportOptionRowProps) {
  return (
    <Pressable
      onPress={async () => {
        await hapticSelection();
        onPress?.();
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Icon color={palette.accent.primary} size={20} strokeWidth={1.75} />
      </View>
      <View style={styles.copy}>
        <AppText variant="body" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="bodySmall">{description}</AppText>
      </View>
      <ChevronRight color={palette.text.tertiary} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border.subtle,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '600',
  },
});
