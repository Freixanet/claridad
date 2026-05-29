import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/motion';
import { OnboardingDots } from '@/components/onboarding';
import { AppText, PrimaryButton, Screen, Spacer, TrustBadge } from '@/components/ui';
import { trustCopy } from '@/data/mockDocuments';
import { palette, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

export default function ReviewBeforeTrustScreen() {
  const router = useRouter();

  return (
    <Screen tone="ivory">
      <View style={styles.center}>
        <FadeInView>
          <View style={styles.emblem}>
            {/* Concentric rings for depth + composition */}
            <View style={[styles.ring, styles.ringOuter]} />
            <View style={[styles.ring, styles.ringMid]} />
            <View style={styles.haloOuter}>
              <View style={styles.haloInner}>
                <View style={styles.check}>
                  <Check color={palette.text.inverse} size={34} strokeWidth={3} />
                </View>
              </View>
            </View>
            {/* Orbiting accent dots */}
            <View style={[styles.orbitDot, styles.orbitTop]} />
            <View style={[styles.orbitDot, styles.orbitRight]} />
            <View style={[styles.orbitDot, styles.orbitBottomLeft]} />
          </View>
        </FadeInView>

        <Spacer size="xl" />

        <FadeInView delay={120}>
          <AppText variant="display" style={styles.title}>
            Tus ideas,{'\n'}por fin claras.
          </AppText>
          <Spacer size="sm" />
          <AppText variant="bodySecondary" style={styles.lead}>
            Más claridad. Más enfoque. Menos caos. Tú revisas cada fragmento antes
            de exportar.
          </AppText>
        </FadeInView>

        <Spacer size="xl" />

        <FadeInView delay={240}>
          <View style={styles.trust}>
            <TrustBadge message={trustCopy.noInvent} />
            <TrustBadge message={trustCopy.markDoubtful} />
          </View>
        </FadeInView>
      </View>

      <FadeInView delay={320}>
        <OnboardingDots total={5} current={4} />
        <Spacer size="lg" />
        <PrimaryButton
          label="Empezar ahora"
          onPress={() => router.push(ClaridadRoutes.auth)}
        />
        <Spacer size="md" />
      </FadeInView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblem: {
    width: 232,
    height: 232,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.accent.primaryMuted,
  },
  ringOuter: {
    width: 232,
    height: 232,
    borderColor: 'rgba(91,79,214,0.10)',
  },
  ringMid: {
    width: 186,
    height: 186,
    borderColor: 'rgba(91,79,214,0.16)',
  },
  haloOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: palette.accent.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.accent.primary,
  },
  orbitTop: {
    top: 14,
    backgroundColor: palette.topic.workAccent,
  },
  orbitRight: {
    right: 18,
    top: 92,
    backgroundColor: palette.topic.shoppingAccent,
  },
  orbitBottomLeft: {
    left: 30,
    bottom: 34,
    backgroundColor: palette.topic.ideasAccent,
  },
  haloInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: palette.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.accent.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  title: {
    textAlign: 'center',
  },
  lead: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    lineHeight: 23,
  },
  trust: {
    gap: spacing.sm,
    width: '100%',
  },
});
