import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';

import { REVIEW_MODE_OPTIONS, type ReviewMode } from '@/components/review/reviewModeTypes';
import { colors, radii } from '@/constants/theme';
import { CLARIDAD_SPRING } from '@/motion/config';

const TRACK_PADDING = 3;

type ReviewModeSwitcherProps = {
  mode: ReviewMode;
  pageWidth: number;
  scrollX: SharedValue<number>;
  pagerRef: AnimatedRef<Animated.ScrollView>;
  onModeChange: (mode: ReviewMode, animated?: boolean) => void;
  renderIcon: (mode: ReviewMode, active: boolean) => ReactNode;
};

export default function ReviewModeSwitcher({
  mode,
  pageWidth,
  scrollX,
  pagerRef,
  onModeChange,
  renderIcon,
}: ReviewModeSwitcherProps) {
  const reducedMotion = useReducedMotion();
  const activeIndex = REVIEW_MODE_OPTIONS.findIndex((option) => option.key === mode);
  const [highlightIndex, setHighlightIndex] = useState(Math.max(0, activeIndex));
  const segmentWidthSV = useSharedValue(0);
  const pageWidthSV = useSharedValue(pageWidth);
  const dragStartIndex = useSharedValue(Math.max(0, activeIndex));
  const pillScale = useSharedValue(1);

  useEffect(() => {
    pageWidthSV.value = pageWidth;
  }, [pageWidth, pageWidthSV]);

  useEffect(() => {
    const index = REVIEW_MODE_OPTIONS.findIndex((option) => option.key === mode);
    if (index >= 0) {
      setHighlightIndex(index);
    }
  }, [mode]);

  useAnimatedReaction(
    () => {
      if (pageWidthSV.value <= 0) return 0;
      return Math.min(
        REVIEW_MODE_OPTIONS.length - 1,
        Math.max(0, Math.round(scrollX.value / pageWidthSV.value))
      );
    },
    (nextIndex, previousIndex) => {
      if (nextIndex !== previousIndex) {
        runOnJS(setHighlightIndex)(nextIndex);
      }
    }
  );

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      segmentWidthSV.value =
        width > 0 ? (width - TRACK_PADDING * 2) / REVIEW_MODE_OPTIONS.length : 0;
    },
    [segmentWidthSV]
  );

  const selectMode = useCallback(
    (nextMode: ReviewMode, animated = true) => {
      onModeChange(nextMode, animated);
    },
    [onModeChange]
  );

  const panGesture = Gesture.Pan()
    .minDistance(4)
    .onBegin(() => {
      if (pageWidthSV.value <= 0) return;
      dragStartIndex.value = Math.round(scrollX.value / pageWidthSV.value);
      pillScale.value = withSpring(reducedMotion ? 1 : 1.05, CLARIDAD_SPRING);
    })
    .onUpdate((event) => {
      const segmentWidth = segmentWidthSV.value;
      const width = pageWidthSV.value;
      if (segmentWidth <= 0 || width <= 0) return;

      const maxDrag = segmentWidth * (REVIEW_MODE_OPTIONS.length - 1);
      const clampedDrag = Math.min(
        maxDrag,
        Math.max(0, dragStartIndex.value * segmentWidth + event.translationX)
      );
      const progress = clampedDrag / segmentWidth;
      const targetScrollX = progress * width;

      scrollTo(pagerRef, targetScrollX, 0, false);
      scrollX.value = targetScrollX;
    })
    .onEnd((event) => {
      pillScale.value = withSpring(1, CLARIDAD_SPRING);

      const segmentWidth = segmentWidthSV.value;
      if (segmentWidth <= 0) return;

      const projected =
        dragStartIndex.value * segmentWidth + event.translationX + event.velocityX * 0.08;
      const nextIndex = Math.min(
        REVIEW_MODE_OPTIONS.length - 1,
        Math.max(0, Math.round(projected / segmentWidth))
      );
      runOnJS(selectMode)(REVIEW_MODE_OPTIONS[nextIndex].key, true);
    })
    .onFinalize(() => {
      pillScale.value = withSpring(1, CLARIDAD_SPRING);
    });

  const pillStyle = useAnimatedStyle(() => {
    const segmentWidth = segmentWidthSV.value;
    const width = pageWidthSV.value;

    if (segmentWidth <= 0) {
      return { opacity: 0, width: 0 };
    }

    const progress = width > 0 ? scrollX.value / width : 0;

    return {
      opacity: 1,
      width: segmentWidth,
      transform: [
        { translateX: TRACK_PADDING + progress * segmentWidth },
        { scale: pillScale.value },
      ],
    };
  });

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGhost,
      }}
    >
      <GestureDetector gesture={panGesture}>
        <View
          onLayout={handleTrackLayout}
          style={{
            flexDirection: 'row',
            backgroundColor: colors.canvasMuted,
            borderRadius: radii.sm,
            padding: TRACK_PADDING,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            position: 'relative',
            minHeight: 38,
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              {
                top: TRACK_PADDING,
                bottom: TRACK_PADDING,
              },
              pillStyle,
            ]}
          />

          {REVIEW_MODE_OPTIONS.map((option, index) => {
            const active = highlightIndex === index;
            return (
              <Pressable
                key={option.key}
                onPress={() => selectMode(option.key)}
                style={styles.segment}
              >
                <View style={styles.segmentInner}>
                  {renderIcon(option.key, active)}
                  <Text
                    style={{
                      fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      fontSize: 12.5,
                      color: active ? colors.foreground : colors.foregroundMuted,
                      letterSpacing: -0.1,
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 0,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderGhost,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 0,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  segmentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
