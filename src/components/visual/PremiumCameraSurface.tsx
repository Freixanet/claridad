import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { palette } from '@/design/tokens';

import { HandwrittenPageMock } from './HandwrittenPageMock';
import { PaperSheet } from './PaperSheet';

type PremiumCameraSurfaceProps = {
  style?: ViewStyle;
};

const BRACKET_SIZE = 30;
const BRACKET_THICKNESS = 3;
const BRACKET_COLOR = 'rgba(255,255,255,0.92)';

function CornerBrackets() {
  const corners: ViewStyle[] = [
    { top: 0, left: 0, borderTopWidth: BRACKET_THICKNESS, borderLeftWidth: BRACKET_THICKNESS },
    { top: 0, right: 0, borderTopWidth: BRACKET_THICKNESS, borderRightWidth: BRACKET_THICKNESS },
    { bottom: 0, left: 0, borderBottomWidth: BRACKET_THICKNESS, borderLeftWidth: BRACKET_THICKNESS },
    { bottom: 0, right: 0, borderBottomWidth: BRACKET_THICKNESS, borderRightWidth: BRACKET_THICKNESS },
  ];
  return (
    <View style={styles.bracketLayer} pointerEvents="none">
      {corners.map((c, i) => (
        <View
          key={i}
          style={[
            { position: 'absolute', width: BRACKET_SIZE, height: BRACKET_SIZE, borderColor: BRACKET_COLOR, borderRadius: 4 },
            c,
          ]}
        />
      ))}
    </View>
  );
}

/**
 * Dark editorial desk scene: warm wood gradient, faint grain, a real-feeling
 * sheet of handwriting under the viewfinder, and a soft vignette.
 */
export function PremiumCameraSurface({ style }: PremiumCameraSurfaceProps) {
  return (
    <View style={[styles.surface, style]}>
      {/* Wood desk gradient */}
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="wood" x1="0.2" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor="#1C160F" />
            <Stop offset="0.5" stopColor="#12100C" />
            <Stop offset="1" stopColor="#0C0A07" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#wood)" />
      </Svg>

      {/* Faint grain stripes */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 7 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: `${i * 15}%`,
              left: '-10%',
              width: '120%',
              height: 1,
              backgroundColor: palette.desk.grain,
              transform: [{ rotate: '-18deg' }],
            }}
          />
        ))}
      </View>

      {/* The captured page */}
      <View style={styles.pageWrap}>
        <PaperSheet rotate={-1.5} ruled style={styles.page}>
          <HandwrittenPageMock lines={14} ink={palette.ink.primary} />
        </PaperSheet>
      </View>

      {/* Vignette */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="46%" r="72%">
            <Stop offset="0.42" stopColor="rgba(0,0,0,0)" />
            <Stop offset="0.82" stopColor="rgba(0,0,0,0.34)" />
            <Stop offset="1" stopColor="rgba(0,0,0,0.78)" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" />
      </Svg>

      <CornerBrackets />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: palette.desk.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageWrap: {
    width: '74%',
    aspectRatio: 0.7,
    justifyContent: 'center',
  },
  page: {
    width: '100%',
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  bracketLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 18,
  },
});
