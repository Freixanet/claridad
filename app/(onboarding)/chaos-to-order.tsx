import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/motion';
import { OnboardingDots } from '@/components/onboarding';
import {
  AppText,
  BrandHeader,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Spacer,
} from '@/components/ui';
import { HandwrittenPageMock, PaperSheet } from '@/components/visual';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

function EditorialScannerPreview() {
  return (
    <View style={styles.preview}>
      <View style={styles.previewHeader}>
        <AppText variant="label" style={styles.previewLabel}>
          Página capturada
        </AppText>
        <View style={styles.confidencePill}>
          <View style={styles.confidenceDot} />
          <AppText variant="label" style={styles.confidenceText}>
            Revisable
          </AppText>
        </View>
      </View>

      <View style={styles.documentStage}>
        <PaperSheet
          rotate={-2}
          tone="warm"
          floating={false}
          style={styles.handwrittenSheet}
        >
          <HandwrittenPageMock lines={12} tone="aged" />
        </PaperSheet>

        <View style={styles.organizedSheet}>
          <AppText variant="label" style={styles.organizedLabel}>
            Documento limpio
          </AppText>
          <AppText variant="h2" style={styles.organizedTitle}>
            Ideas del proyecto
          </AppText>
          <View style={styles.rule} />

          <View style={styles.topicBlock}>
            <View style={styles.topicHeader}>
              <View style={styles.topicDot} />
              <AppText variant="label" style={styles.topicLabel}>
                Trabajo
              </AppText>
            </View>
            <AppText variant="bodySmall" style={styles.topicText}>
              Reunión con Ana · Enviar propuesta
            </AppText>
          </View>

          <View style={styles.topicBlock}>
            <View style={styles.topicHeader}>
              <View style={[styles.topicDot, styles.topicDotSoft]} />
              <AppText variant="label" style={styles.topicLabel}>
                Ideas
              </AppText>
            </View>
            <AppText variant="bodySmall" style={styles.topicText}>
              Onboarding más simple
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ChaosToOrderScreen() {
  const router = useRouter();

  return (
    <Screen tone="paper" scroll contentStyle={styles.screen}>
      <BrandHeader compact />

      <FadeInView>
        <EditorialScannerPreview />
      </FadeInView>

      <Spacer size="lg" />

      <FadeInView delay={120}>
        <AppText variant="eyebrow" style={styles.eyebrow}>
          Premium editorial scanner
        </AppText>
        <Spacer size="xs" />
        <AppText variant="display" style={styles.title}>
          De página caótica a documento claro.
        </AppText>
        <Spacer size="sm" />
        <AppText variant="bodySecondary" style={styles.lead}>
          Claridad reorganiza tus notas manuscritas por temas, conserva la
          intención y marca lo dudoso antes de exportar.
        </AppText>
      </FadeInView>

      <Spacer size="lg" />

      <FadeInView delay={240}>
        <View style={styles.trustRow}>
          <AppText variant="caption" style={styles.trustItem}>
            No inventa contenido
          </AppText>
          <View style={styles.trustSeparator} />
          <AppText variant="caption" style={styles.trustItem}>
            Revisión antes de exportar
          </AppText>
        </View>
        <Spacer size="md" />
        <OnboardingDots total={5} current={0} />
        <Spacer size="lg" />
        <PrimaryButton
          label="Comenzar"
          onPress={() => router.push(ClaridadRoutes.onboarding2)}
          style={styles.primaryCta}
        />
        <Spacer size="xs" />
        <SecondaryButton
          label="¿Ya tienes cuenta? Iniciar sesión"
          onPress={() => router.push(ClaridadRoutes.auth)}
          style={styles.secondaryCta}
        />
      </FadeInView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.sm,
  },
  preview: {
    backgroundColor: palette.background.elevated,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    padding: spacing.md,
    overflow: 'hidden',
    ...shadows.soft,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  previewLabel: {
    color: palette.text.tertiary,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    backgroundColor: palette.background.paper,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent.primary,
  },
  confidenceText: {
    color: palette.text.secondary,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  documentStage: {
    minHeight: 270,
  },
  handwrittenSheet: {
    width: '68%',
    height: 244,
    borderRadius: radius.lg,
    opacity: 0.92,
    backgroundColor: '#F6F1E8',
  },
  organizedSheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '64%',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    backgroundColor: '#FFFDF8',
    padding: spacing.md,
    ...shadows.card,
  },
  organizedLabel: {
    color: palette.accent.primary,
  },
  organizedTitle: {
    marginTop: 3,
    letterSpacing: -0.3,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border.subtle,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  topicBlock: {
    gap: 4,
    paddingVertical: spacing.xs,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent.primary,
  },
  topicDotSoft: {
    backgroundColor: palette.semantic.doubtBorder,
  },
  topicLabel: {
    color: palette.text.secondary,
    fontSize: 10,
  },
  topicText: {
    color: palette.text.primary,
    lineHeight: 18,
  },
  eyebrow: {
    color: palette.accent.primary,
  },
  title: {
    fontSize: 38,
    lineHeight: 43,
    letterSpacing: -1.1,
  },
  lead: {
    lineHeight: 24,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  trustItem: {
    color: palette.text.secondary,
  },
  trustSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.text.tertiary,
  },
  primaryCta: {
    borderRadius: radius.md,
    minHeight: 50,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  secondaryCta: {
    minHeight: 42,
    paddingVertical: spacing.xs,
  },
});
