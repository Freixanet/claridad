import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/design/tokens';

import { AppText } from './AppText';
import { BrandHeader } from './BrandHeader';
import { Screen } from './Screen';

type RouteStubProps = {
  screenNumber: string;
  title: string;
  description: string;
  tone?: 'ivory' | 'paper' | 'dark';
  children?: ReactNode;
};

/**
 * Minimal route placeholder — not a final screen.
 * Full UI for each of the 15 screens comes in a later phase.
 */
export function RouteStub({
  screenNumber,
  title,
  description,
  tone = 'ivory',
  children,
}: RouteStubProps) {
  const isDark = tone === 'dark';
  const titleColor = isDark ? palette.text.onDark : undefined;
  const bodyColor = isDark ? palette.text.onDarkMuted : undefined;

  return (
    <Screen tone={tone} scroll>
      <BrandHeader subtitle={`Pantalla ${screenNumber} · base de ruta`} compact />
      <View style={styles.copy}>
        <AppText variant="h1" color={titleColor}>
          {title}
        </AppText>
        <AppText variant="bodySecondary" color={bodyColor}>
          {description}
        </AppText>
      </View>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
