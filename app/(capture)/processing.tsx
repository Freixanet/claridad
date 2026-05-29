import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { FadeInView } from '@/components/motion';
import { ProcessingOrb } from '@/components/capture';
import { AppText, Spacer } from '@/components/ui';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, spacing } from '@/design/tokens';
import { hapticSelection, hapticSuccess } from '@/utils/haptics';
import { ClaridadRoutes } from '@/types';

const STEPS = [
  { label: 'Detectando escritura', caption: 'Localizamos cada trazo de tu página' },
  { label: 'Identificando fragmentos', caption: 'Separamos ideas, no solo texto' },
  { label: 'Agrupando por temas', caption: 'Reunimos lo que va junto' },
  { label: 'Generando estructura', caption: 'Construimos tu documento limpio' },
];

const STEP_DELAY_MS = 750;

/** A step row that fades/slides in as it is reached and pops its check when done. */
function StepRow({
  label,
  stepDone,
  active,
}: {
  label: string;
  stepDone: boolean;
  active: boolean;
}) {
  const reached = stepDone || active;
  const reach = useSharedValue(reached ? 1 : 0);
  const pop = useSharedValue(stepDone ? 1 : 0);

  useEffect(() => {
    reach.value = withTiming(reached ? 1 : 0, {
      duration: motionDuration.normal,
      easing: motionEasing.calm,
    });
  }, [reached, reach]);

  useEffect(() => {
    pop.value = withTiming(stepDone ? 1 : 0, {
      duration: motionDuration.fast,
      easing: motionEasing.standard,
    });
  }, [stepDone, pop]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + reach.value * 0.6,
    transform: [{ translateX: (1 - reach.value) * -6 }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.4 + pop.value * 0.6 }],
    opacity: pop.value,
  }));

  return (
    <Animated.View style={[styles.stepRow, rowStyle]}>
      <View
        style={[
          styles.stepDot,
          stepDone && styles.stepDotDone,
          active && styles.stepDotActive,
        ]}
      >
        {stepDone ? (
          <Animated.View style={checkStyle}>
            <Check color={palette.text.inverse} size={11} strokeWidth={3} />
          </Animated.View>
        ) : (
          <View style={[styles.innerDot, active && styles.innerDotActive]} />
        )}
      </View>
      <AppText
        variant="body"
        color={stepDone || active ? palette.text.onDark : palette.text.onDarkMuted}
        style={stepDone || active ? styles.stepTextActive : undefined}
      >
        {label}
      </AppText>
    </Animated.View>
  );
}

function ProgressBar({ ratio }: { ratio: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: motionDuration.slow,
      easing: motionEasing.calm,
    });
  }, [ratio, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

export default function ProcessingScreen() {
  const router = useRouter();
  const [completedCount, setCompletedCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setCompletedCount(i + 1);
          if (i < STEPS.length - 1) setCurrentStep(i + 1);
          void hapticSelection();
        }, (i + 1) * STEP_DELAY_MS),
      );
    });
    timers.push(
      setTimeout(() => {
        void hapticSuccess();
        router.replace(ClaridadRoutes.result);
      }, STEPS.length * STEP_DELAY_MS + 450),
    );
    return () => timers.forEach(clearTimeout);
  }, [router]);

  const done = completedCount >= STEPS.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Background depth glow */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="38%" r="60%">
            <Stop offset="0" stopColor="#241F4A" stopOpacity="0.9" />
            <Stop offset="1" stopColor={palette.background.dark} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
      </Svg>

      <View style={styles.content}>
        <View style={styles.orbZone}>
          <FadeInView>
            <ProcessingOrb />
          </FadeInView>
        </View>

        <View style={styles.copyZone}>
          <AppText variant="eyebrow" color={palette.accent.ring} style={styles.center}>
            Claridad está leyendo
          </AppText>
          <Spacer size="xs" />
          <AppText variant="h1" color={palette.text.onDark} style={styles.center}>
            {done ? 'Tu documento está listo' : `${STEPS[currentStep].label}…`}
          </AppText>
          <Spacer size="xs" />
          <AppText
            variant="bodySmall"
            color={palette.text.onDarkMuted}
            style={styles.center}
          >
            {done ? 'Abriendo el resultado organizado' : STEPS[currentStep].caption}
          </AppText>

          <Spacer size="xl" />

          <View style={styles.stepCard}>
            <ProgressBar ratio={completedCount / STEPS.length} />
            <Spacer size="xs" />
            {STEPS.map((step, i) => (
              <StepRow
                key={step.label}
                label={step.label}
                stepDone={i < completedCount}
                active={i === currentStep && !done}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background.dark,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  orbZone: {
    alignItems: 'center',
  },
  copyZone: {
    marginTop: spacing.xl,
  },
  center: {
    textAlign: 'center',
  },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.accent.ring,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: palette.accent.primary,
    borderColor: palette.accent.primary,
  },
  stepDotActive: {
    borderColor: palette.accent.ring,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  innerDotActive: {
    backgroundColor: palette.accent.ring,
  },
  stepTextActive: {
    fontWeight: '600',
  },
});
