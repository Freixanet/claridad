import { useRouter } from 'expo-router';
import { Grid3X3, Settings2, X, Zap } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { PremiumCameraSurface } from '@/components/visual';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, spacing } from '@/design/tokens';
import { hapticMedium } from '@/utils/haptics';
import { ClaridadRoutes } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A live focus frame that gently breathes to signal an active viewfinder. */
function FocusFrame() {
  const breathe = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [breathe]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.03 }],
    opacity: 0.55 + breathe.value * 0.25,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.focusFrame, style]}>
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </Animated.View>
  );
}

function TopControl({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof Zap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.topBtn, pressed && styles.topBtnPressed]}
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Icon color="rgba(255,255,255,0.85)" size={20} strokeWidth={1.75} />
    </Pressable>
  );
}

export default function CaptureScreen() {
  const router = useRouter();

  const coreScale = useSharedValue(1);
  const flash = useSharedValue(0);

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const goToProcessing = () => router.push(ClaridadRoutes.processing);

  const onShutter = async () => {
    await hapticMedium();
    // Quick shutter flash, then advance once it settles.
    flash.value = withSequence(
      withTiming(0.9, { duration: 70, easing: motionEasing.standard }),
      withTiming(0, { duration: 260, easing: motionEasing.calm }, (finished) => {
        if (finished) runOnJS(goToProcessing)();
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TopControl icon={X} label="Cerrar" onPress={() => router.back()} />
        <View style={styles.topRight}>
          <TopControl icon={Zap} label="Flash" />
          <TopControl icon={Grid3X3} label="Cuadrícula" />
          <TopControl icon={Settings2} label="Ajustes de cámara" />
        </View>
      </View>

      {/* Camera surface */}
      <View style={styles.surfaceWrap}>
        <PremiumCameraSurface style={styles.surface} />

        {/* Live focus frame */}
        <FocusFrame />

        {/* Hint */}
        <View style={styles.hint}>
          <View style={styles.hintDot} />
          <AppText variant="caption" color="rgba(255,255,255,0.9)">
            Encuadra tu página · detección automática
          </AppText>
        </View>

        {/* Auto badge */}
        <View style={styles.autoBadge}>
          <Zap color={palette.accent.ring} size={12} strokeWidth={2.5} />
          <AppText variant="label" color="#fff" style={styles.autoText}>
            Auto
          </AppText>
        </View>

        {/* Capture flash */}
        <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.thumbnail}>
          <View style={styles.thumbnailInner} />
        </View>

        <AnimatedPressable
          style={styles.shutter}
          onPressIn={() => {
            coreScale.value = withTiming(0.82, { duration: motionDuration.instant });
          }}
          onPressOut={() => {
            coreScale.value = withSequence(
              withTiming(1.06, { duration: motionDuration.fast }),
              withTiming(1, { duration: motionDuration.fast, easing: motionEasing.calm }),
            );
          }}
          onPress={onShutter}
          accessibilityLabel="Capturar foto"
        >
          <View style={styles.shutterRing}>
            <Animated.View style={[styles.shutterCore, coreStyle]} />
          </View>
        </AnimatedPressable>

        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.desk.base,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  topBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  surfaceWrap: {
    flex: 1,
    marginHorizontal: spacing.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  surface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  focusFrame: {
    position: 'absolute',
    top: '26%',
    bottom: '26%',
    left: '14%',
    right: '14%',
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 8,
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  hint: {
    position: 'absolute',
    top: spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  hintDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.accent.ring,
  },
  autoBadge: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  autoText: {
    color: '#fff',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: 3,
  },
  thumbnailInner: {
    flex: 1,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  shutter: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  bottomSpacer: {
    width: 50,
  },
});
