import { ArrowRight } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { palette, radius, shadows, spacing } from '@/design/tokens';

import { HandwrittenPageMock } from './HandwrittenPageMock';
import { PaperSheet } from './PaperSheet';

/** A connector that gently nudges right, guiding the eye from chaos to clarity. */
function FlowConnector() {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [t]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: t.value * 3 }],
    opacity: 0.85 + t.value * 0.15,
  }));

  return (
    <View style={styles.connector}>
      <Animated.View style={style}>
        <ArrowRight color={palette.accent.primary} size={18} strokeWidth={2.5} />
      </Animated.View>
    </View>
  );
}

type OrganizedTag = { label: string; bg: string; accent: string; items: string[] };

const organized: OrganizedTag[] = [
  {
    label: 'Trabajo',
    bg: palette.topic.work,
    accent: palette.topic.workAccent,
    items: ['Reunión con Ana', 'Enviar propuesta'],
  },
  {
    label: 'Compras',
    bg: palette.topic.shopping,
    accent: palette.topic.shoppingAccent,
    items: ['Leche', 'Pan integral'],
  },
];

/**
 * Editorial hero: scattered handwritten notes (chaos) resolving into a clean,
 * organized document (clarity). Used on onboarding and value moments.
 */
export function ChaosToStructurePreview() {
  return (
    <View style={styles.wrap}>
      {/* Chaos: overlapping rotated handwritten notes */}
      <View style={styles.chaos}>
        <PaperSheet
          rotate={-7}
          tone="aged"
          style={[styles.note, styles.noteBack]}
          padded={false}
        >
          <View style={styles.notePad}>
            <HandwrittenPageMock lines={6} compact tone="aged" />
          </View>
        </PaperSheet>
        <PaperSheet rotate={5} style={[styles.note, styles.noteMid]} padded={false}>
          <View style={styles.notePad}>
            <HandwrittenPageMock lines={6} compact />
          </View>
          <View style={styles.sticky} />
        </PaperSheet>
        <PaperSheet rotate={-2} style={[styles.note, styles.noteFront]} padded={false}>
          <View style={styles.notePad}>
            <HandwrittenPageMock lines={7} compact />
          </View>
        </PaperSheet>
      </View>

      {/* Connector */}
      <FlowConnector />

      {/* Clarity: clean organized document */}
      <View style={styles.organized}>
        <AppText variant="eyebrow" style={styles.organizedEyebrow}>
          Organizado
        </AppText>
        <View style={styles.organizedBody}>
          {organized.map((topic) => (
            <View key={topic.label} style={styles.topicBlock}>
              <View style={[styles.topicTag, { backgroundColor: topic.bg }]}>
                <AppText variant="label" style={{ color: topic.accent, fontSize: 9 }}>
                  {topic.label}
                </AppText>
              </View>
              {topic.items.map((item) => (
                <View key={item} style={styles.itemRow}>
                  <View style={[styles.itemDot, { backgroundColor: topic.accent }]} />
                  <AppText variant="caption" style={styles.itemText}>
                    {item}
                  </AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 220,
  },
  chaos: {
    width: 150,
    height: '100%',
    justifyContent: 'center',
  },
  note: {
    position: 'absolute',
    width: 120,
    height: 130,
  },
  notePad: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  noteBack: {
    top: 18,
    left: 0,
  },
  noteMid: {
    top: 46,
    left: 26,
  },
  noteFront: {
    top: 6,
    left: 14,
  },
  sticky: {
    position: 'absolute',
    top: -6,
    right: 18,
    width: 26,
    height: 14,
    backgroundColor: palette.accent.primaryMuted,
    borderRadius: 3,
    transform: [{ rotate: '6deg' }],
  },
  connector: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.accent.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -4,
    zIndex: 2,
    ...shadows.soft,
  },
  organized: {
    flex: 1,
    backgroundColor: palette.background.elevated,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    padding: spacing.md,
    marginLeft: -4,
    ...shadows.card,
  },
  organizedEyebrow: {
    marginBottom: spacing.sm,
  },
  organizedBody: {
    gap: spacing.md,
  },
  topicBlock: {
    gap: 5,
  },
  topicTag: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  itemText: {
    color: palette.text.secondary,
    fontSize: 11,
  },
});
