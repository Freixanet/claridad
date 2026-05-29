import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MoreHorizontal, PenLine, Search, Type } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/motion';
import { AppText, IconButton, Spacer, TrustBadge } from '@/components/ui';
import { TopicSection } from '@/components/visual';
import { mockDocuments, trustCopy } from '@/data/mockDocuments';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { hapticLight } from '@/utils/haptics';
import { ClaridadRoutes } from '@/types';

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function DocumentViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fabBottom = spacing.xxl + insets.bottom;
  const document = mockDocuments.find((d) => d.id === id) ?? mockDocuments[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Navigation bar */}
      <View style={styles.navbar}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Volver"
          onPress={() => router.back()}
        />
        <View style={styles.navActions}>
          <IconButton icon={Search} accessibilityLabel="Buscar en documento" />
          <IconButton icon={Type} accessibilityLabel="Tipografía" />
          <IconButton
            icon={MoreHorizontal}
            accessibilityLabel="Más opciones"
            onPress={() => router.push(ClaridadRoutes.export)}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: spacing.xxxl + fabBottom }]}
      >
        {/* Editorial masthead */}
        <FadeInView>
          <AppText variant="eyebrow">Documento</AppText>
          <Spacer size="xs" />
          <AppText variant="display">{document.title}</AppText>
          <Spacer size="sm" />
          <View style={styles.metaRow}>
            <AppText variant="caption">{formatLongDate(document.updatedAt)}</AppText>
            <View style={styles.metaDot} />
            <AppText variant="caption">{document.topicCount} temas</AppText>
            <View style={styles.metaDot} />
            <AppText variant="caption">{document.fragmentCount} fragmentos</AppText>
          </View>
          <View style={styles.rule} />
        </FadeInView>

        <Spacer size="md" />

        {document.topics.map((group, i) => (
          <FadeInView key={group.id} delay={i * 90}>
            <TopicSection group={group} index={i} />
          </FadeInView>
        ))}

        <Spacer size="xs" />
        <TrustBadge message={trustCopy.onlyReorganize} />
        <Spacer size="xxxl" />
      </ScrollView>

      {/* Floating edit FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, { bottom: fabBottom }, pressed && styles.fabPressed]}
        onPress={async () => {
          await hapticLight();
          router.push(ClaridadRoutes.export);
        }}
        accessibilityLabel="Editar documento"
      >
        <PenLine color={palette.text.inverse} size={22} strokeWidth={2} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background.paper,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  navActions: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.text.tertiary,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border.warm,
    marginTop: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  fabPressed: {
    backgroundColor: palette.accent.primaryPressed,
    transform: [{ scale: 0.97 }],
  },
});
