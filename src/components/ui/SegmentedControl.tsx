import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, spacing } from '@/design/tokens';
import { hapticSelection } from '@/utils/haptics';

import { AppText } from './AppText';

const TRACK_PADDING = 3;
const TAB_GAP = 2;

type SegmentedControlProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'premium';
};

export function SegmentedControl({
  options,
  value,
  onChange,
  variant = 'default',
}: SegmentedControlProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = options.indexOf(value);
  const position = useSharedValue(index < 0 ? 0 : index);
  const premium = variant === 'premium';

  useEffect(() => {
    position.value = withTiming(index < 0 ? 0 : index, {
      duration: motionDuration.normal,
      easing: motionEasing.calm,
    });
  }, [index, position]);

  const count = options.length;
  const innerWidth = trackWidth - TRACK_PADDING * 2;
  const tabWidth =
    count > 0 ? (innerWidth - TAB_GAP * (count - 1)) / count : 0;

  const thumbStyle = useAnimatedStyle(() => ({
    width: tabWidth,
    transform: [{ translateX: position.value * (tabWidth + TAB_GAP) }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.track, premium && styles.premiumTrack]} onLayout={onLayout}>
      {tabWidth > 0 ? (
        <Animated.View style={[styles.thumb, premium && styles.premiumThumb, thumbStyle]} />
      ) : null}
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            style={styles.tab}
            onPress={async () => {
              await hapticSelection();
              onChange(option);
            }}
          >
            <AppText
              variant="bodySmall"
              style={[
                styles.label,
                active && styles.labelActive,
                premium && styles.premiumLabel,
                premium && active && styles.premiumLabelActive,
              ]}
            >
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: palette.background.elevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.subtle,
    padding: TRACK_PADDING,
    gap: TAB_GAP,
  },
  thumb: {
    position: 'absolute',
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: radius.sm,
    backgroundColor: palette.accent.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    color: palette.text.secondary,
  },
  labelActive: {
    color: palette.text.inverse,
  },
  premiumTrack: {
    backgroundColor: palette.background.paper,
    borderColor: palette.border.warm,
    borderRadius: radius.lg,
  },
  premiumThumb: {
    backgroundColor: '#FFFDF8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
  },
  premiumLabel: {
    fontSize: 13,
    color: palette.text.secondary,
  },
  premiumLabelActive: {
    color: palette.accent.primary,
  },
});
