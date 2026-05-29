import { Camera } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { palette, radius, spacing } from '@/design/tokens';

/** Visual placeholder until expo-camera is wired in a later phase. */
export function CapturePlaceholder() {
  return (
    <View style={styles.frame}>
      <Camera color={palette.text.onDarkMuted} size={48} strokeWidth={1.5} />
      <AppText variant="bodySmall" color={palette.text.onDarkMuted}>
        Vista de cámara (mock)
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    minHeight: 320,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: palette.overlay.capture,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
