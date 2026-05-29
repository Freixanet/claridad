import { useRouter } from 'expo-router';
import { Camera, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/motion';
import { DocumentCard } from '@/components/document';
import {
  AppText,
  FilterChip,
  IconButton,
  SearchBar,
  Spacer,
} from '@/components/ui';
import { mockDocuments } from '@/data/mockDocuments';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';
import { hapticLight } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FILTERS = ['Todos', 'Hoy', 'Esta semana', 'Este mes'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const fabBottom = spacing.xl + insets.bottom;

  const fabEnter = useSharedValue(0);
  const fabScale = useSharedValue(1);

  useEffect(() => {
    fabEnter.value = withDelay(
      260,
      withTiming(1, { duration: motionDuration.slow, easing: motionEasing.calm }),
    );
  }, [fabEnter]);

  const fabStyle = useAnimatedStyle(() => ({
    opacity: fabEnter.value,
    transform: [
      { scale: fabScale.value * (0.7 + fabEnter.value * 0.3) },
      { translateY: (1 - fabEnter.value) * 16 },
    ],
  }));

  const filtered = mockDocuments.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText variant="eyebrow" style={styles.greetingEyebrow}>
            Viernes, 29 de mayo
          </AppText>
          <AppText variant="h1">Hola, Alex 👋</AppText>
        </View>
        <IconButton
          icon={Settings}
          accessibilityLabel="Ajustes"
          onPress={() => router.push(ClaridadRoutes.settings)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: spacing.xxxl + fabBottom }]}
      >
        <FadeInView>
          <SearchBar value={search} onChangeText={setSearch} />
        </FadeInView>

        <Spacer size="md" />

        <FadeInView delay={60}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {FILTERS.map((f) => (
              <FilterChip
                key={f}
                label={f}
                active={activeFilter === f}
                onPress={() => setActiveFilter(f)}
              />
            ))}
          </ScrollView>
        </FadeInView>

        <Spacer size="lg" />

        <View style={styles.sectionHeader}>
          <AppText variant="label" style={styles.sectionLabel}>
            {activeFilter === 'Todos' ? 'Recientes' : activeFilter}
          </AppText>
          <AppText variant="caption">{filtered.length} documentos</AppText>
        </View>
        <Spacer size="sm" />

        {filtered.length > 0 ? (
          filtered.map((doc, i) => (
            <FadeInView key={doc.id} delay={80 + i * 50}>
              <DocumentCard
                document={doc}
                onPress={() => router.push(`/(document)/${doc.id}`)}
              />
            </FadeInView>
          ))
        ) : (
          <View style={styles.emptySearch}>
            <AppText variant="bodySecondary">
              No hay documentos que coincidan.
            </AppText>
          </View>
        )}

        <Spacer size="xxxl" />
      </ScrollView>

      {/* FAB */}
      <AnimatedPressable
        onPressIn={() => {
          fabScale.value = withTiming(0.92, { duration: motionDuration.instant });
        }}
        onPressOut={() => {
          fabScale.value = withTiming(1, {
            duration: motionDuration.fast,
            easing: motionEasing.calm,
          });
        }}
        onPress={async () => {
          await hapticLight();
          router.push(ClaridadRoutes.capture);
        }}
        style={[styles.fab, { bottom: fabBottom }, fabStyle]}
        accessibilityLabel="Capturar nueva página"
      >
        <Camera color={palette.text.inverse} size={26} strokeWidth={2} />
      </AnimatedPressable>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    gap: 3,
  },
  greetingEyebrow: {
    color: palette.text.tertiary,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxs,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  filters: {
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  sectionLabel: {
    paddingHorizontal: spacing.xxs,
  },
  emptySearch: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
});
