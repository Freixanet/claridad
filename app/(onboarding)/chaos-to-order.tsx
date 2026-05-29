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
import { ChaosToStructurePreview } from '@/components/visual';
import { spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

export default function ChaosToOrderScreen() {
  const router = useRouter();

  return (
    <Screen tone="ivory" scroll>
      <BrandHeader compact />

      <FadeInView>
        <View style={styles.hero}>
          <ChaosToStructurePreview />
        </View>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={120}>
        <AppText variant="display">Del caos{'\n'}al orden.</AppText>
        <Spacer size="sm" />
        <AppText variant="bodySecondary" style={styles.lead}>
          Convierte tus notas manuscritas desordenadas en documentos claros,
          titulados por temas y fieles a lo que escribiste.
        </AppText>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={240}>
        <OnboardingDots total={5} current={0} />
        <Spacer size="lg" />
        <PrimaryButton
          label="Comenzar"
          onPress={() => router.push(ClaridadRoutes.onboarding2)}
        />
        <Spacer size="sm" />
        <SecondaryButton
          label="¿Ya tienes cuenta? Iniciar sesión"
          onPress={() => router.push(ClaridadRoutes.auth)}
        />
      </FadeInView>
      <Spacer size="md" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.sm,
  },
  lead: {
    lineHeight: 23,
  },
});
