import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/motion';
import { AppText, PrimaryButton, Screen, Spacer, TrustBadge } from '@/components/ui';
import { HandwrittenPageMock, PaperSheet } from '@/components/visual';
import { trustCopy } from '@/data/mockDocuments';
import { palette, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

export default function EmptyStateScreen() {
  const router = useRouter();

  return (
    <Screen tone="ivory">
      <View style={styles.center}>
        <FadeInView>
          {/* Paper stack illustration */}
          <View style={styles.stack}>
            <PaperSheet rotate={-8} tone="aged" style={[styles.sheet, styles.back]} padded={false}>
              <View style={styles.sheetPad}>
                <HandwrittenPageMock lines={6} compact tone="aged" />
              </View>
            </PaperSheet>
            <PaperSheet rotate={5} style={[styles.sheet, styles.front]} padded={false}>
              <View style={styles.sheetPad}>
                <HandwrittenPageMock lines={7} compact />
              </View>
            </PaperSheet>
            {/* Action hint badge */}
            <View style={styles.cameraBadge}>
              <Camera color={palette.text.inverse} size={20} strokeWidth={2} />
            </View>
          </View>

          <Spacer size="xxl" />

          <AppText variant="eyebrow" style={styles.eyebrow}>
            Tu primer documento
          </AppText>
          <Spacer size="xxs" />
          <AppText variant="hero" style={styles.title}>
            Aquí aparecerán{'\n'}tus páginas.
          </AppText>
          <Spacer size="sm" />
          <AppText variant="bodySecondary" style={styles.sub}>
            Captura tu primera nota manuscrita y mira cómo el caos se convierte en
            un documento claro.
          </AppText>

          <Spacer size="xxl" />

          <PrimaryButton
            label="Capturar mi primera página"
            onPress={() => router.push(ClaridadRoutes.capture)}
          />
          <Spacer size="lg" />
          <TrustBadge message={trustCopy.noInvent} />
        </FadeInView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  stack: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    width: 124,
    height: 140,
  },
  sheetPad: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  back: {
    left: '50%',
    marginLeft: -82,
  },
  front: {
    left: '50%',
    marginLeft: -42,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 18,
    right: '50%',
    marginRight: -96,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.background.ivory,
    shadowColor: palette.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
  },
  eyebrow: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  sub: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
});
