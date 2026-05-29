import { useRouter } from 'expo-router';
import { Check, Copy, FileText, Hash, Share2, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/motion';
import { AppText, IconButton, Spacer, TrustBadge } from '@/components/ui';
import { ExportFormatCard, HandwrittenPageMock, PaperSheet } from '@/components/visual';
import { featuredDocument, trustCopy } from '@/data/mockDocuments';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { hapticSuccess } from '@/utils/haptics';

const FORMATS = [
  {
    key: 'pdf',
    icon: FileText,
    iconBg: '#FBE6E1',
    iconColor: '#D0492B',
    title: 'Exportar a PDF',
    description: 'Documento limpio para imprimir o compartir.',
    badge: 'Recomendado',
    toast: 'PDF generado',
  },
  {
    key: 'md',
    icon: Hash,
    iconBg: '#E7EAF0',
    iconColor: '#33363B',
    title: 'Exportar a Markdown',
    description: 'Ideal para notas y herramientas de escritura.',
    toast: 'Markdown generado',
  },
  {
    key: 'copy',
    icon: Copy,
    iconBg: palette.accent.primaryMuted,
    iconColor: palette.accent.primary,
    title: 'Copiar al portapapeles',
    description: 'Fragmentos organizados para pegar donde quieras.',
    toast: 'Copiado al portapapeles',
  },
  {
    key: 'share',
    icon: Share2,
    iconBg: '#E2EEFB',
    iconColor: '#2D74C4',
    title: 'Compartir',
    description: 'Comparte tu documento con quien quieras.',
    toast: 'Listo para compartir',
  },
] as const;

export default function ExportScreen() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const toastProgress = useSharedValue(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const showToast = async (message: string) => {
    await hapticSuccess();
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast(message);
    toastProgress.value = withTiming(1, {
      duration: motionDuration.normal,
      easing: motionEasing.enter,
    });
    hideTimer.current = setTimeout(() => {
      toastProgress.value = withTiming(0, {
        duration: motionDuration.normal,
        easing: motionEasing.exit,
      });
    }, 1600);
  };

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastProgress.value,
    transform: [{ translateY: (1 - toastProgress.value) * 24 }],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.spacer} />
        <AppText variant="h3">Exportar</AppText>
        <IconButton icon={X} accessibilityLabel="Cerrar" onPress={() => router.back()} />
      </View>

      <View style={styles.content}>
        <FadeInView>
          {/* Finished document preview */}
          <View style={styles.previewRow}>
            <PaperSheet padded={false} style={styles.previewThumb}>
              <View style={styles.previewPad}>
                <HandwrittenPageMock lines={6} compact />
              </View>
            </PaperSheet>
            <View style={styles.previewCopy}>
              <AppText variant="eyebrow">Documento listo</AppText>
              <AppText variant="h3">{featuredDocument.title}</AppText>
              <AppText variant="bodySmall">
                {featuredDocument.topicCount} temas organizados
              </AppText>
            </View>
          </View>

          <Spacer size="lg" />
          <AppText variant="bodySecondary">Elige el formato que prefieras.</AppText>
          <Spacer size="md" />
        </FadeInView>

        {FORMATS.map((format, i) => (
          <FadeInView key={format.key} delay={80 + i * 70}>
            <ExportFormatCard
              icon={format.icon}
              iconBg={format.iconBg}
              iconColor={format.iconColor}
              title={format.title}
              description={format.description}
              badge={'badge' in format ? format.badge : undefined}
              onPress={() => showToast(format.toast)}
            />
          </FadeInView>
        ))}

        <FadeInView delay={400}>
          <Spacer size="lg" />
          <TrustBadge message={trustCopy.onlyReorganize} />
        </FadeInView>
      </View>

      {/* Confirmation toast */}
      {toast ? (
        <Animated.View pointerEvents="none" style={[styles.toast, toastStyle]}>
          <View style={styles.toastCheck}>
            <Check color={palette.text.inverse} size={14} strokeWidth={3} />
          </View>
          <AppText variant="bodySmall" color={palette.text.onDark} style={styles.toastText}>
            {toast}
          </AppText>
        </Animated.View>
      ) : null}
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
    paddingVertical: spacing.sm,
  },
  spacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.background.paper,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    padding: spacing.md,
  },
  previewThumb: {
    width: 54,
    height: 66,
    borderRadius: radius.sm,
  },
  previewPad: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  previewCopy: {
    flex: 1,
    gap: 2,
  },
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.background.dark,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.fab,
  },
  toastCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.semantic.successText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontWeight: '600',
  },
});
