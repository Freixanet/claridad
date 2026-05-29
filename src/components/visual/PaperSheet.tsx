import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { palette, radius, shadows, spacing } from '@/design/tokens';

type PaperSheetProps = {
  children?: ReactNode;
  ruled?: boolean;
  rotate?: number;
  tone?: 'base' | 'warm' | 'aged';
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  floating?: boolean;
};

const toneColor = {
  base: palette.paper.base,
  warm: palette.paper.warm,
  aged: palette.paper.aged,
} as const;

/**
 * A sheet of physical-feeling paper: warm surface, soft top highlight,
 * warm hairline edge, layered shadow, optional ruled lines and slight tilt.
 */
export function PaperSheet({
  children,
  ruled = false,
  rotate = 0,
  tone = 'base',
  style,
  padded = true,
  floating = true,
}: PaperSheetProps) {
  return (
    <View
      style={[
        styles.sheet,
        floating && shadows.paper,
        { backgroundColor: toneColor[tone], transform: [{ rotate: `${rotate}deg` }] },
        padded && styles.padded,
        style,
      ]}
    >
      {/* Warm top highlight to suggest light catching the paper */}
      <View style={styles.highlight} pointerEvents="none" />
      {ruled ? (
        <View style={styles.ruled} pointerEvents="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={styles.ruleLine} />
          ))}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.paper.edge,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.45)',
    opacity: 0.6,
  },
  ruled: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.xl,
    justifyContent: 'space-between',
  },
  ruleLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.paper.line,
    marginHorizontal: spacing.sm,
  },
});
