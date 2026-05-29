import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/motion';
import { OnboardingDots } from '@/components/onboarding';
import { AppText, PrimaryButton, Screen, Spacer } from '@/components/ui';
import { PremiumCameraSurface } from '@/components/visual';
import { palette, radius, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

function DeviceMock() {
  return (
    <View style={device.shadowWrap}>
      <View style={device.frame}>
        {/* Metallic edge highlight */}
        <View style={device.bezel}>
          <View style={device.screen}>
            {/* Dynamic island */}
            <View style={device.island} />
            <PremiumCameraSurface style={device.surface} />
            {/* Capture overlay */}
            <View style={device.hud}>
              <View style={device.hudPill}>
                <View style={device.hudDot} />
                <AppText variant="label" color="rgba(255,255,255,0.85)" style={device.hudText}>
                  Auto
                </AppText>
              </View>
            </View>
            <View style={device.shutterRow}>
              <View style={device.shutterRing}>
                <View style={device.shutter}>
                  <Camera color="#fff" size={15} strokeWidth={2} />
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* Side button */}
        <View style={device.sideButton} />
      </View>
    </View>
  );
}

export default function PhotographPageScreen() {
  const router = useRouter();

  return (
    <Screen tone="ivory" scroll>
      <Spacer size="md" />

      <FadeInView>
        <View style={styles.deviceWrap}>
          <DeviceMock />
        </View>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={100}>
        <AppText variant="hero">Tomas la foto.</AppText>
        <Spacer size="sm" />
        <AppText variant="bodySecondary" style={styles.lead}>
          Una página desordenada, como siempre. Tú disparas, Claridad se encarga
          del resto.
        </AppText>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={200}>
        <OnboardingDots total={5} current={1} />
        <Spacer size="lg" />
        <PrimaryButton
          label="Siguiente"
          onPress={() => router.push(ClaridadRoutes.onboarding3)}
        />
      </FadeInView>
      <Spacer size="md" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  deviceWrap: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  lead: {
    lineHeight: 23,
  },
});

const FRAME_W = 184;
const FRAME_H = 372;

const device = StyleSheet.create({
  shadowWrap: {
    shadowColor: '#171310',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.34,
    shadowRadius: 38,
    elevation: 14,
  },
  frame: {
    width: FRAME_W,
    height: FRAME_H,
    borderRadius: 44,
    backgroundColor: '#0B0A0C',
    padding: 4,
    position: 'relative',
  },
  bezel: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: '#000',
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  screen: {
    flex: 1,
    borderRadius: 37,
    backgroundColor: palette.desk.base,
    overflow: 'hidden',
  },
  island: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    width: 64,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#000',
    zIndex: 3,
  },
  surface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hud: {
    position: 'absolute',
    top: 42,
    right: 14,
    zIndex: 2,
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hudDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.accent.ring,
  },
  hudText: {
    fontSize: 8,
  },
  shutterRow: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    zIndex: 2,
  },
  shutterRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButton: {
    position: 'absolute',
    right: -2,
    top: 104,
    width: 3,
    height: 46,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: '#050507',
  },
});
