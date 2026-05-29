import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/motion';
import { BottomActionBar } from '@/components/document';
import {
  AppText,
  IconButton,
  SegmentedControl,
  Spacer,
  TrustBadge,
} from '@/components/ui';
import {
  HandwrittenPageMock,
  PaperSheet,
  TopicSection,
} from '@/components/visual';
import { featuredDocument, trustCopy } from '@/data/mockDocuments';
import { palette, radius, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

export default function ResultScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('Organizado');

  const fragmentTotal = featuredDocument.topics.reduce(
    (sum, t) => sum + t.fragments.length,
    0,
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Volver"
          onPress={() => router.back()}
        />
        <AppText variant="h3">Resultado</AppText>
        <View style={styles.readyBadge}>
          <Sparkles color={palette.semantic.successText} size={12} strokeWidth={2.5} />
          <AppText variant="label" style={styles.readyText}>
            Listo
          </AppText>
        </View>
      </View>

      <View style={styles.summary}>
        <AppText variant="bodySmall">
          {featuredDocument.topicCount} temas · {fragmentTotal} fragmentos · fiel a tu
          escritura
        </AppText>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <SegmentedControl
          options={['Organizado', 'Original']}
          value={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'Organizado' ? (
          <FadeInView key="organized" fromOpacity={0.5} offsetY={0} duration={180}>
            {/* Source contrast strip */}
            <Pressable style={styles.sourceStrip} onPress={() => setTab('Original')}>
              <PaperSheet padded={false} floating={false} style={styles.sourceThumb}>
                <View style={styles.sourceThumbPad}>
                  <HandwrittenPageMock lines={5} compact />
                </View>
              </PaperSheet>
              <View style={styles.sourceCopy}>
                <AppText variant="eyebrow" style={styles.sourceEyebrow}>
                  Del caos al orden
                </AppText>
                <AppText variant="bodySmall">
                  Organizado desde tu página manuscrita
                </AppText>
              </View>
              <AppText variant="label" style={styles.sourceLink}>
                Ver original
              </AppText>
            </Pressable>

            <Spacer size="lg" />

            {featuredDocument.topics.map((group, i) => (
              <FadeInView key={group.id} delay={i * 90}>
                <TopicSection group={group} index={i} showChevron />
              </FadeInView>
            ))}

            <Spacer size="xs" />
            <TrustBadge message={trustCopy.markDoubtful} />
            <Spacer size="sm" />
            <TrustBadge message={trustCopy.reviewBeforeExport} />
          </FadeInView>
        ) : (
          <FadeInView key="original" fromOpacity={0.5} offsetY={0} duration={180}>
            <AppText variant="eyebrow" style={styles.originalEyebrow}>
              Tu página · tal como la escribiste
            </AppText>
            <Spacer size="sm" />
            <PaperSheet ruled tone="warm">
              <HandwrittenPageMock lines={15} />
            </PaperSheet>
            <Spacer size="md" />
            <TrustBadge message={trustCopy.noInvent} />
          </FadeInView>
        )}
        <Spacer size="xxxl" />
      </ScrollView>

      <BottomActionBar
        onExport={() => router.push(ClaridadRoutes.export)}
        onMore={() => router.push(ClaridadRoutes.review)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background.ivory,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.semantic.success,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  readyText: {
    color: palette.semantic.successText,
  },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  tabs: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  sourceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.background.paper,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    padding: spacing.sm,
  },
  sourceThumb: {
    width: 48,
    height: 56,
    borderRadius: radius.sm,
  },
  sourceThumbPad: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sourceCopy: {
    flex: 1,
    gap: 2,
  },
  sourceEyebrow: {
    color: palette.accent.primary,
  },
  sourceLink: {
    color: palette.accent.primary,
  },
  originalEyebrow: {
    color: palette.text.secondary,
  },
});
