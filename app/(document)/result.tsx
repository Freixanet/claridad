import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
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
        <View style={styles.readyBadge}>
          <ShieldCheck color={palette.accent.primary} size={14} strokeWidth={2.2} />
          <AppText variant="label" style={styles.readyText}>
            Listo para revisar
          </AppText>
        </View>
      </View>

      <View style={styles.summary}>
        <AppText variant="eyebrow" style={styles.summaryEyebrow}>
          Resultado
        </AppText>
        <Spacer size="xs" />
        <AppText variant="display" style={styles.summaryTitle}>
          Documento organizado.
        </AppText>
        <Spacer size="xs" />
        <AppText variant="bodySmall" style={styles.summaryCopy}>
          {featuredDocument.topicCount} temas · {fragmentTotal} fragmentos · fiel a tu escritura
        </AppText>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <SegmentedControl
          options={['Organizado', 'Original']}
          value={tab}
          onChange={setTab}
          variant="premium"
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
                  <HandwrittenPageMock lines={7} compact tone="aged" />
                </View>
              </PaperSheet>
              <View style={styles.sourceCopy}>
                <AppText variant="eyebrow" style={styles.sourceEyebrow}>
                  Fuente manuscrita
                </AppText>
                <AppText variant="bodySmall">
                  Conservamos intención y marcamos incertidumbre.
                </AppText>
              </View>
              <AppText variant="label" style={styles.sourceLink}>
                Ver original
              </AppText>
            </Pressable>

            <Spacer size="lg" />

            {featuredDocument.topics.map((group, i) => (
              <FadeInView key={group.id} delay={i * 90}>
                <TopicSection group={group} index={i} showChevron variant="premium" />
              </FadeInView>
            ))}

            <Spacer size="xs" />
            <View style={styles.trustPanel}>
              <TrustBadge message={trustCopy.markDoubtful} />
              <TrustBadge message={trustCopy.reviewBeforeExport} />
            </View>
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
        variant="premium"
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
    gap: 6,
    backgroundColor: palette.accent.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  readyText: {
    color: palette.accent.primary,
    fontSize: 10,
  },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  summaryEyebrow: {
    color: palette.accent.primary,
  },
  summaryTitle: {
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -0.9,
  },
  summaryCopy: {
    color: palette.text.secondary,
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
    backgroundColor: '#FFFDF8',
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  sourceThumb: {
    width: 60,
    height: 74,
    borderRadius: radius.md,
  },
  sourceThumbPad: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
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
  trustPanel: {
    gap: spacing.sm,
  },
});
