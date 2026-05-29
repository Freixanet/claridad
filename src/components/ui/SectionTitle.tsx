import { StyleSheet, View } from 'react-native';

import { spacing } from '@/design/tokens';

import { AppText } from './AppText';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="h3">{title}</AppText>
      {subtitle ? <AppText variant="bodySmall">{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
});
