import { Check, PenLine } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import type { ClaridadDocument } from '@/types';

import { HandwrittenPageMock } from './HandwrittenPageMock';
import { PaperSheet } from './PaperSheet';
import { TopicSection } from './TopicSection';

type ReviewSplitPanelProps = {
  document: ClaridadDocument;
};

/**
 * Sophisticated fidelity comparison: the original handwritten page on top,
 * the faithful organized result below, framed as a controlled human review.
 */
export function ReviewSplitPanel({ document }: ReviewSplitPanelProps) {
  return (
    <View>
      {/* Original */}
      <View style={styles.labelRow}>
        <PenLine color={palette.text.secondary} size={15} strokeWidth={2} />
        <AppText variant="eyebrow" style={styles.originalLabel}>
          Original · tu escritura
        </AppText>
      </View>
      <PaperSheet ruled tone="warm" style={styles.original}>
        <HandwrittenPageMock lines={11} />
      </PaperSheet>

      {/* Connector band */}
      <View style={styles.band}>
        <View style={styles.bandLine} />
        <View style={styles.bandPill}>
          <Check color={palette.accent.primary} size={13} strokeWidth={3} />
          <AppText variant="label" style={styles.bandText}>
            Fiel a tu texto
          </AppText>
        </View>
        <View style={styles.bandLine} />
      </View>

      {/* Organized */}
      <View style={styles.labelRow}>
        <AppText variant="eyebrow">Organizado · por temas</AppText>
      </View>
      <View>
        {document.topics.map((group, i) => (
          <TopicSection key={group.id} group={group} index={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  originalLabel: {
    color: palette.text.secondary,
  },
  original: {
    marginBottom: spacing.xs,
  },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  bandLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border.strong,
  },
  bandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.accent.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.accent.primaryMuted,
    ...shadows.soft,
  },
  bandText: {
    color: palette.accent.primary,
  },
});
