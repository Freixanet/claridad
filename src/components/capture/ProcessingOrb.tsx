import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

import { palette } from '@/design/tokens';

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 82;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC = CIRCUMFERENCE * 0.28;

/** Premium glowing ring: radial halo, gradient donut, and a rotating highlight. */
export function ProcessingOrb() {
  const haloScale = useSharedValue(0.9);
  const haloOpacity = useSharedValue(0.5);
  const spin = useSharedValue(0);
  const ringScale = useSharedValue(0.96);

  useEffect(() => {
    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1600 }),
        withTiming(0.45, { duration: 1600 }),
      ),
      -1,
      true,
    );
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    spin.value = withRepeat(
      withTiming(360, { duration: 3600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [haloScale, haloOpacity, spin, ringScale]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <View style={styles.wrap}>
      {/* Radial halo glow */}
      <Animated.View style={[StyleSheet.absoluteFill, haloStyle]}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={palette.glow.core} stopOpacity="0.55" />
              <Stop offset="0.55" stopColor={palette.glow.mid} stopOpacity="0.22" />
              <Stop offset="1" stopColor={palette.glow.mid} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={CENTER} cy={CENTER} r={CENTER} fill="url(#halo)" />
        </Svg>
      </Animated.View>

      {/* Base donut ring */}
      <Animated.View style={ringStyle}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={palette.glow.edge} />
              <Stop offset="1" stopColor={palette.glow.mid} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="url(#ring)"
            strokeWidth={14}
            fill="none"
            opacity={0.45}
          />
        </Svg>

        {/* Rotating bright highlight arc */}
        <Animated.View style={[StyleSheet.absoluteFill, arcStyle]}>
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <LinearGradient id="arc" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.glow.core} />
                <Stop offset="1" stopColor={palette.accent.ring} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="url(#arc)"
              strokeWidth={14}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${ARC} ${CIRCUMFERENCE - ARC}`}
            />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Inner core */}
      <View style={styles.core}>
        <View style={styles.coreDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139,123,240,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.glow.core,
    shadowColor: palette.glow.core,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
});
