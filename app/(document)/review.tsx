import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/motion';
import { AppText, IconButton, Spacer, TrustBadge } from '@/components/ui';
import { ReviewSplitPanel } from '@/components/visual';
import { featuredDocument, trustCopy } from '@/data/mockDocuments';
import { motionDuration, motionEasing } from '@/design/motion';
import { palette, radius, shadows, spacing } from '@/design/tokens';
import { hapticSuccess } from '@/utils/haptics';
import { ClaridadRoutes } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ReviewScreen() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  const pressScale = useSharedValue(1);
  const checkPop = useSharedValue(1);

  useEffect(() => {
    if (confirmed) {
      checkPop.value = withSequence(
        withTiming(1.35, { duration: motionDuration.fast, easing: motionEasing.standard }),
        withTiming(1, { duration: motionDuration.normal, easing: motionEasing.calm }),
      );
    }
  }, [confirmed, checkPop]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkPop.value }],
  }));

  const doubtCount = featuredDocument.topics
    .flatMap((t) => t.fragments)
    .filter((f) => f.confidence === 'doubt').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Volver"
          onPress={() => router.back()}
        />
        <AppText variant="h3">Revisar</AppText>
        <View style={styles.spacer} />
      </View>

      {/* Doubt banner */}
      {doubtCount > 0 ? (
        <View style={styles.doubtBanner}>
          <AlertTriangle color={palette.semantic.doubtBorder} size={16} strokeWidth={2} />
          <AppText variant="bodySmall" style={styles.doubtText}>
            {doubtCount} fragmento{doubtCount > 1 ? 's' : ''} marcado
            {doubtCount > 1 ? 's' : ''} para que revises
          </AppText>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView>
          <AppText variant="bodySecondary" style={styles.intro}>
            Compara tu página original con el documento organizado. Tú tienes la
            última palabra.
          </AppText>
          <Spacer size="lg" />

          <ReviewSplitPanel document={featuredDocument} />

          <Spacer size="xs" />
          <TrustBadge message={trustCopy.noInvent} />
          <Spacer size="sm" />
          <TrustBadge message={trustCopy.onlyReorganize} />
        </FadeInView>
        <Spacer size="xxxl" />
      </ScrollView>

      {/* Confirm bar */}
      <View style={styles.confirmBar}>
        <AnimatedPressable
          disabled={confirmed}
          onPressIn={() => {
            pressScale.value = withTiming(0.97, { duration: motionDuration.instant });
          }}
          onPressOut={() => {
            pressScale.value = withTiming(1, {
              duration: motionDuration.fast,
              easing: motionEasing.calm,
            });
          }}
          onPress={async () => {
            await hapticSuccess();
            setConfirmed(true);
            setTimeout(() => router.push(ClaridadRoutes.export), 420);
          }}
          style={[styles.confirmBtn, confirmed && styles.confirmBtnDone, btnStyle]}
        >
          <Animated.View
            style={[styles.checkCircle, confirmed && styles.checkCircleDone, checkStyle]}
          >
            <Check
              color={confirmed ? palette.semantic.successText : palette.text.inverse}
              size={15}
              strokeWidth={3}
            />
          </Animated.View>
          <AppText variant="button">
            {confirmed ? 'Confirmado · todo coincide' : 'Todo coincide'}
          </AppText>
        </AnimatedPressable>
      </View>
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
  doubtBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.semantic.doubt,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.semantic.doubtBorder,
  },
  doubtText: {
    color: palette.semantic.doubtText,
    fontWeight: '500',
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  intro: {
    lineHeight: 22,
  },
  confirmBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: palette.background.ivory,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border.subtle,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: palette.accent.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    minHeight: 54,
    ...shadows.fab,
  },
  confirmBtnDone: {
    backgroundColor: palette.semantic.successText,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: '#fff',
  },
});
