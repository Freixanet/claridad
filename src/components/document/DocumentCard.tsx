import { ChevronRight, FileText } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import type { ClaridadDocument } from '@/types';
import { hapticSelection } from '@/utils/haptics';
import { formatRelativeDate } from '@/utils/date';
import { topicColors } from '@/utils/topic';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DocumentCardProps = {
  document: ClaridadDocument;
  onPress?: () => void;
};

export function DocumentCard({ document, onPress }: DocumentCardProps) {
  const lead = document.topics[0];
  const colors = topicColors(lead ? lead.kind : 'work');
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: motionDuration.instant });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, {
          duration: motionDuration.fast,
          easing: motionEasing.calm,
        });
      }}
      onPress={async () => {
        await hapticSelection();
        onPress?.();
      }}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconTile, { backgroundColor: colors.background }]}>
          <FileText color={colors.accent} size={17} strokeWidth={2} />
        </View>
        <View style={styles.titleWrap}>
          <AppText variant="h3" numberOfLines={1}>
            {document.title}
          </AppText>
          <AppText variant="caption">
            {formatRelativeDate(document.updatedAt)} · {document.fragmentCount} fragmentos
          </AppText>
        </View>
        <ChevronRight color={palette.text.tertiary} size={17} strokeWidth={2} />
      </View>

      {/* Topic tags — shows the document is organized */}
      <View style={styles.tags}>
        {document.topics.map((topic) => {
          const tc = topicColors(topic.kind);
          return (
            <View key={topic.id} style={[styles.tag, { backgroundColor: tc.background }]}>
              <View style={[styles.tagDot, { backgroundColor: tc.accent }]} />
              <AppText variant="label" style={[styles.tagLabel, { color: tc.accent }]}>
                {topic.title}
              </AppText>
            </View>
          );
        })}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.background.elevated,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    gap: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    paddingLeft: 38 + spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  tagLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'none',
  },
});
