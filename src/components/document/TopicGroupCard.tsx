import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { palette, radius, spacing } from '@/design/tokens';
import type { TopicGroup } from '@/types';
import { topicColors } from '@/utils/topic';

type TopicGroupCardProps = {
  group: TopicGroup;
};

export function TopicGroupCard({ group }: TopicGroupCardProps) {
  const colors = topicColors(group.kind);

  return (
    <Card style={styles.card} elevated={false}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <AppText variant="label" style={{ color: colors.accent }}>
          {group.title}
        </AppText>
      </View>
      <View style={styles.body}>
        {group.fragments.map((fragment) => (
          <View key={fragment.id} style={styles.fragmentRow}>
            <AppText variant="body">· {fragment.text}</AppText>
            {fragment.confidence === 'doubt' ? (
              <AppText variant="caption" style={styles.doubt}>
                dudoso
              </AppText>
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: palette.background.elevated,
  },
  fragmentRow: {
    gap: spacing.xxs,
  },
  doubt: {
    color: palette.semantic.doubtBorder,
  },
});
