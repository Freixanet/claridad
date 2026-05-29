import { StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/design/tokens';

export function Divider() {
  return <View style={styles.line} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border.subtle,
    marginVertical: spacing.md,
  },
});
