import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/motion';
import { OnboardingDots } from '@/components/onboarding';
import { AppText, PrimaryButton, Screen, Spacer } from '@/components/ui';
import { TopicSection } from '@/components/visual';
import { featuredDocument } from '@/data/mockDocuments';
import { spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

export default function GroupedByTopicsScreen() {
  const router = useRouter();

  return (
    <Screen tone="ivory" scroll>
      <Spacer size="md" />

      <FadeInView>
        <AppText variant="eyebrow">Resumen organizado</AppText>
        <Spacer size="xs" />
        <AppText variant="hero">Agrupado{'\n'}por temas.</AppText>
        <Spacer size="sm" />
        <AppText variant="bodySecondary" style={styles.lead}>
          Cada idea encuentra su lugar. Trabajo, compras, proyectos: todo
          ordenado sin perder tu intención.
        </AppText>
      </FadeInView>

      <Spacer size="lg" />

      <View>
        {featuredDocument.topics.map((group, i) => (
          <FadeInView key={group.id} delay={120 + i * 110}>
            <TopicSection group={group} index={i} showChevron />
          </FadeInView>
        ))}
      </View>

      <Spacer size="md" />

      <FadeInView delay={480}>
        <OnboardingDots total={5} current={3} />
        <Spacer size="lg" />
        <PrimaryButton
          label="Siguiente"
          onPress={() => router.push(ClaridadRoutes.onboarding5)}
        />
      </FadeInView>
      <Spacer size="md" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    lineHeight: 23,
  },
});
