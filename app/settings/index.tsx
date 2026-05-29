import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/motion';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { AppText, IconButton, Spacer } from '@/components/ui';
import { palette, radius, spacing } from '@/design/tokens';
import { ClaridadRoutes } from '@/types';

function AccountHeader() {
  return (
    <View style={accountStyles.wrap}>
      <View style={accountStyles.avatar}>
        <AppText variant="h2" color={palette.text.inverse}>
          A
        </AppText>
      </View>
      <View style={accountStyles.info}>
        <AppText variant="h3" color={palette.text.onDark}>
          Alex
        </AppText>
        <AppText
          variant="bodySmall"
          color={palette.text.onDarkMuted}
          numberOfLines={1}
        >
          alex@ejemplo.com
        </AppText>
      </View>
      <View style={accountStyles.planBadge}>
        <AppText variant="caption" style={accountStyles.planText}>
          Claridad Pro
        </AppText>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Volver"
          tone="dark"
          onPress={() => router.back()}
        />
        <AppText variant="h3" color={palette.text.onDark}>
          Ajustes
        </AppText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <FadeInView>
          <AccountHeader />
          <Spacer size="xl" />

          <SettingsSection title="Cuenta">
            <SettingsRow label="Perfil" value="Alex" onPress={() => undefined} />
            <SettingsRow label="Correo" value="alex@ejemplo.com" />
            <SettingsRow label="Plan" value="Claridad Pro" onPress={() => undefined} last />
          </SettingsSection>

          <SettingsSection title="Preferencias">
            <SettingsRow label="Idioma" value="Español" onPress={() => undefined} />
            <SettingsRow label="Tema" value="Sistema" onPress={() => undefined} />
            <SettingsRow
              label="Exportación por defecto"
              value="PDF"
              onPress={() => undefined}
            />
            <View style={styles.toggleRow}>
              <AppText variant="body" color={palette.text.onDark}>
                Recordatorios
              </AppText>
              <Switch
                value={true}
                trackColor={{
                  false: 'rgba(255,255,255,0.12)',
                  true: palette.accent.primary,
                }}
                ios_backgroundColor="rgba(255,255,255,0.12)"
              />
            </View>
          </SettingsSection>

          <SettingsSection title="Ayuda">
            <SettingsRow label="Centro de ayuda" onPress={() => undefined} />
            <SettingsRow label="Enviar comentarios" onPress={() => undefined} />
            <SettingsRow label="Privacidad" onPress={() => undefined} last />
          </SettingsSection>

          <Pressable
            onPress={() => router.replace(ClaridadRoutes.auth)}
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
          >
            <AppText variant="body" color={palette.semantic.dangerText} style={styles.logoutText}>
              Cerrar sesión
            </AppText>
          </Pressable>
          <Spacer size="md" />
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  logout: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(192,57,43,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(192,57,43,0.18)',
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutText: {
    fontWeight: '600',
  },
});

const accountStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.background.darkElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  planBadge: {
    backgroundColor: palette.accent.primaryMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  planText: {
    color: palette.accent.primary,
    fontWeight: '600',
  },
});
