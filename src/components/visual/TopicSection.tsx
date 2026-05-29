import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import type { TopicGroup } from '@/types';
import { topicColors } from '@/utils/topic';

type TopicSectionProps = {
  group: TopicGroup;
  showChevron?: boolean;
  index?: number;
  variant?: 'default' | 'premium';
};

/** A single editorial topic block: colored eyebrow, title, refined fragment list. */
export function TopicSection({
  group,
  showChevron = false,
  index,
  variant = 'default',
}: TopicSectionProps) {
  const colors = topicColors(group.kind);
  const premium = variant === 'premium';

  return (
    <View style={[styles.card, premium && styles.premiumCard]}>
      <View
        style={[
          styles.accent,
          premium && styles.premiumAccent,
          { backgroundColor: colors.accent },
        ]}
      />
      <View style={[styles.inner, premium && styles.premiumInner]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.tag,
                premium && styles.premiumTag,
                { backgroundColor: premium ? 'transparent' : colors.background },
              ]}
            >
              <AppText
                variant="eyebrow"
                style={[premium && styles.premiumTagText, { color: colors.accent }]}
              >
                {group.title}
              </AppText>
            </View>
            {index !== undefined ? (
              <AppText variant="caption" style={styles.count}>
                {group.fragments.length} elementos
              </AppText>
            ) : null}
          </View>
          {showChevron ? (
            <ChevronRight color={palette.text.tertiary} size={18} strokeWidth={2} />
          ) : null}
        </View>

        <View style={styles.fragments}>
          {group.fragments.map((fragment) => {
            const doubt = fragment.confidence === 'doubt';
            return (
              <View
                key={fragment.id}
                style={[styles.fragmentRow, premium && styles.premiumFragmentRow]}
              >
                <View
                  style={[
                    styles.bullet,
                    premium && styles.premiumBullet,
                    { backgroundColor: doubt ? palette.semantic.doubtBorder : colors.accent },
                  ]}
                />
                <AppText variant="body" style={styles.fragmentText}>
                  {fragment.text}
                </AppText>
                {doubt ? (
                  <View style={[styles.doubtPill, premium && styles.premiumDoubtPill]}>
                    <AppText variant="label" style={styles.doubtPillText}>
                      revisar
                    </AppText>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.background.elevated,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  accent: {
    width: 3,
  },
  inner: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tag: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  count: {
    color: palette.text.tertiary,
  },
  fragments: {
    gap: spacing.sm,
  },
  fragmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fragmentText: {
    flex: 1,
  },
  doubtPill: {
    backgroundColor: palette.semantic.doubt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.semantic.doubtBorder,
  },
  doubtPillText: {
    color: palette.semantic.doubtText,
    fontSize: 9,
  },
  premiumCard: {
    borderRadius: radius.xl,
    backgroundColor: '#FFFDF8',
    marginBottom: spacing.md,
    shadowOpacity: 0.035,
    shadowRadius: 8,
  },
  premiumAccent: {
    width: 2,
  },
  premiumInner: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  premiumTag: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  premiumTagText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  premiumFragmentRow: {
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  premiumBullet: {
    width: 5,
    height: 5,
    marginTop: 8,
  },
  premiumDoubtPill: {
    backgroundColor: '#FFF7E6',
    paddingVertical: 2,
  },
});
