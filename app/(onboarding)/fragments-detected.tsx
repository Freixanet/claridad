import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { FadeInView } from '@/components/motion';
import { OnboardingDots } from '@/components/onboarding';
import { AppText, PrimaryButton, Screen, Spacer } from '@/components/ui';
import { HandwrittenPageMock, PaperSheet } from '@/components/visual';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

/** A soft accent band that sweeps down the page, suggesting active reading. */
function ScanBand() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300,
      withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 196 }],
    opacity: 0.35 + (1 - Math.abs(progress.value - 0.5) * 2) * 0.4,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.scanBand, style]}>
      <View style={styles.scanLine} />
    </Animated.View>
  );
}

type Fragment = { text: string; color: string; accent: string; top: number; left: number; rotate: number };

const fragments: Fragment[] = [
  { text: 'Reunión diseño', color: palette.topic.work, accent: palette.topic.workAccent, top: 28, left: 18, rotate: -3 },
  { text: 'Leche · café · pan', color: palette.topic.shopping, accent: palette.topic.shoppingAccent, top: 96, left: 120, rotate: 2 },
  { text: 'Onboarding más corto', color: palette.topic.project, accent: palette.topic.projectAccent, top: 168, left: 40, rotate: -1.5 },
];

export default function FragmentsDetectedScreen() {
  const router = useRouter();

  return (
    <Screen tone="ivory" scroll>
      <Spacer size="md" />

      <FadeInView>
        <View style={styles.stage}>
          {/* The page being read */}
          <PaperSheet ruled tone="warm" style={styles.page}>
            <HandwrittenPageMock lines={12} />
          </PaperSheet>

          {/* Scanning band sweeping across the page */}
          <ScanBand />

          {/* Live detection counter */}
          <View style={styles.counter}>
            <View style={styles.counterDot} />
            <AppText variant="label" style={styles.counterText}>
              3 detectados
            </AppText>
          </View>

          {/* Detected fragment chips floating over the page */}
          {fragments.map((f, i) => (
            <FadeInView
              key={f.text}
              delay={500 + i * 220}
              style={[
                styles.chip,
                { top: f.top, left: f.left, transform: [{ rotate: `${f.rotate}deg` }] },
              ]}
            >
              <View style={[styles.chipDot, { backgroundColor: f.accent }]} />
              <AppText variant="bodySmall" style={styles.chipText}>
                {f.text}
              </AppText>
            </FadeInView>
          ))}
        </View>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={120}>
        <AppText variant="eyebrow">Lectura inteligente</AppText>
        <Spacer size="xxs" />
        <AppText variant="hero">Detecta cada{'\n'}fragmento.</AppText>
        <Spacer size="sm" />
        <AppText variant="bodySecondary" style={styles.lead}>
          Claridad no transcribe línea a línea: identifica ideas completas dentro
          de tu página.
        </AppText>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={240}>
        <OnboardingDots total={5} current={2} />
        <Spacer size="lg" />
        <PrimaryButton
          label="Siguiente"
          onPress={() => router.push(ClaridadRoutes.onboarding4)}
        />
      </FadeInView>
      <Spacer size="md" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 250,
    marginTop: spacing.sm,
  },
  page: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    bottom: 0,
  },
  scanBand: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    height: 30,
    justifyContent: 'center',
    backgroundColor: palette.accent.primarySoft,
    borderRadius: 6,
  },
  scanLine: {
    height: 2,
    marginHorizontal: 8,
    borderRadius: 2,
    backgroundColor: palette.accent.ring,
  },
  counter: {
    position: 'absolute',
    top: 14,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.background.dark,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  counterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent.ring,
  },
  counterText: {
    color: palette.text.inverse,
    fontSize: 9,
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.background.elevated,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    ...shadows.card,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipText: {
    color: palette.text.primary,
    fontWeight: '600',
  },
  lead: {
    lineHeight: 23,
  },
});
