import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { palette, radius, shadows, spacing } from '@/design/tokens';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  elevated?: boolean;
};

export function Card({
  children,
  onPress,
  style,
  padded = true,
  elevated = true,
}: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        elevated && shadows.card,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.background.elevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.96,
  },
});
