import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { layout, palette, spacing } from '@/design/tokens';

type ScreenTone = 'ivory' | 'paper' | 'dark';

type ScreenProps = {
  children: ReactNode;
  tone?: ScreenTone;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  padded?: boolean;
};

const toneBackground: Record<ScreenTone, string> = {
  ivory: palette.background.ivory,
  paper: palette.background.paper,
  dark: palette.background.dark,
};

export function Screen({
  children,
  tone = 'ivory',
  scroll = false,
  edges = ['top', 'bottom'],
  contentStyle,
  padded = true,
}: ScreenProps) {
  const backgroundColor = toneBackground[tone];
  const paddingStyle = padded
    ? {
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingVertical: layout.screenPaddingVertical,
      }
    : undefined;

  const content = (
    <View style={[styles.inner, paddingStyle, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  inner: {
    flex: 1,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
});
