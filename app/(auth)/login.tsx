import { useRouter } from 'expo-router';
import { Apple, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { FadeInView } from '@/components/motion';
import { AppText, PrimaryButton, Screen, Spacer } from '@/components/ui';
import { palette, radius, spacing } from '@/design/tokens';
import { fontSize } from '@/design/typography';
import { ClaridadRoutes } from '@/types';

function AppleGlyph() {
  return (
    <View style={socialStyles.glyph}>
      <Apple color={palette.text.primary} size={17} strokeWidth={2} fill={palette.text.primary} />
    </View>
  );
}

function GoogleGlyph() {
  return (
    <View style={socialStyles.glyph}>
      <AppText variant="bodySmall" style={socialStyles.googleText}>
        G
      </AppText>
    </View>
  );
}

function SocialButton({
  label,
  glyph,
  onPress,
}: {
  label: string;
  glyph: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [socialStyles.btn, pressed && socialStyles.pressed]}
    >
      {glyph}
      <AppText variant="bodySmall" style={socialStyles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  return (
    <Screen tone="paper" scroll>
      <Spacer size="xxl" />

      {/* Boutique centered brand */}
      <FadeInView>
        <View style={styles.brand}>
          <View style={styles.mark}>
            <Sparkles color={palette.accent.primary} size={20} strokeWidth={2} />
          </View>
          <Spacer size="md" />
          <AppText variant="eyebrow" style={styles.eyebrow}>
            Claridad
          </AppText>
          <Spacer size="xxs" />
          <AppText variant="hero" style={styles.title}>
            Bienvenido{'\n'}de nuevo
          </AppText>
        </View>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={80}>
        <View style={styles.form}>
          <View>
            <AppText variant="label" style={styles.fieldLabel}>
              Correo electrónico
            </AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor={palette.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View>
            <AppText variant="label" style={styles.fieldLabel}>
              Contraseña
            </AppText>
            <View style={styles.passwordWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={palette.text.tertiary}
                secureTextEntry={!showPwd}
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable
                onPress={() => setShowPwd((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={8}
              >
                {showPwd ? (
                  <EyeOff color={palette.text.tertiary} size={17} strokeWidth={1.75} />
                ) : (
                  <Eye color={palette.text.tertiary} size={17} strokeWidth={1.75} />
                )}
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.forgotWrap}>
            <AppText variant="caption" style={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </AppText>
          </Pressable>
        </View>

        <Spacer size="lg" />
        <PrimaryButton
          label="Iniciar sesión"
          onPress={() => router.replace(ClaridadRoutes.home)}
        />

        <Spacer size="lg" />
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <AppText variant="caption" style={styles.dividerText}>
            o continúa con
          </AppText>
          <View style={styles.dividerLine} />
        </View>
        <Spacer size="md" />

        <View style={styles.social}>
          <SocialButton
            label="Continuar con Apple"
            glyph={<AppleGlyph />}
            onPress={() => router.replace(ClaridadRoutes.home)}
          />
          <SocialButton
            label="Continuar con Google"
            glyph={<GoogleGlyph />}
            onPress={() => router.replace(ClaridadRoutes.home)}
          />
        </View>
      </FadeInView>

      <Spacer size="xl" />

      <FadeInView delay={200}>
        <View style={styles.footer}>
          <AppText variant="caption" style={styles.privacy}>
            No inventamos contenido. Tus documentos son privados y solo tuyos.
          </AppText>
          <Spacer size="sm" />
          <View style={styles.registerRow}>
            <AppText variant="bodySmall" color={palette.text.secondary}>
              ¿No tienes cuenta?{' '}
            </AppText>
            <Pressable onPress={() => router.push(ClaridadRoutes.auth)} hitSlop={6}>
              <AppText variant="bodySmall" style={styles.registerLink}>
                Regístrate
              </AppText>
            </Pressable>
          </View>
        </View>
      </FadeInView>
      <Spacer size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    letterSpacing: 2,
  },
  title: {
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  fieldLabel: {
    marginBottom: 6,
    color: palette.text.secondary,
  },
  input: {
    backgroundColor: palette.background.elevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.body,
    color: palette.text.primary,
    minHeight: 46,
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing.xl + spacing.sm,
  },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
  },
  forgotLink: {
    color: palette.accent.primary,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border.warm,
  },
  dividerText: {
    color: palette.text.tertiary,
  },
  social: {
    gap: spacing.sm,
  },
  footer: {
    alignItems: 'center',
  },
  privacy: {
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 17,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerLink: {
    color: palette.accent.primary,
    fontWeight: '700',
  },
});

const socialStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: palette.background.elevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.warm,
    paddingVertical: 12,
    minHeight: 46,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontWeight: '600',
    color: palette.text.primary,
  },
  glyph: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    fontWeight: '700',
    color: '#4285F4',
    fontSize: 15,
  },
});
