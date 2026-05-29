import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen, Spacer, TrustBadge } from '@/components/ui';
import { spacing } from '@/design/tokens';

type OnboardingShellProps = {
  children: ReactNode;
  trustMessage?: string;
};

/** Layout shell for onboarding — full screens come in a later phase. */
export function OnboardingShell({ children, trustMessage }: OnboardingShellProps) {
  return (
    <Screen tone="ivory" scroll>
      <View style={styles.content}>{children}</View>
      {trustMessage ? (
        <>
          <Spacer size="lg" />
          <TrustBadge message={trustMessage} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
});
