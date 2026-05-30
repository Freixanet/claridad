import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Sparkles,
  Languages,
  ShieldCheck,
  FileText,
  Star,
  HelpCircle,
  Mail,
  Crown,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { colors, radii } from '@/constants/theme';
import Pill from '@/components/Pill';
import {
  getProcessingPreferences,
  saveProcessingPreferences,
} from '@/services/processingPreferences';
import { usePlanMode } from '@/hooks/usePlanMode';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

type RowProps = {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
};

function Row({ icon, label, hint, trailing, onPress, isLast }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.borderGhost,
        backgroundColor: pressed ? colors.canvasMuted : 'transparent',
        gap: 12,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.canvasMuted,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.borderGhost,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.foreground }}>
          {label}
        </Text>
        {hint ? (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: colors.foregroundMuted,
              marginTop: 2,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      {trailing ?? <ChevronRight color={colors.foregroundSoft} size={18} strokeWidth={2} />}
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: colors.foregroundMuted,
        marginBottom: 8,
        paddingHorizontal: 4,
      }}
    >
      {children}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.borderGhost,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();
  const { isPro, setPlan } = usePlanMode();
  const [highFidelity, setHighFidelity] = useState(true);
  const [autoTitle, setAutoTitle] = useState(true);

  useEffect(() => {
    (async () => {
      const prefs = await getProcessingPreferences();
      setHighFidelity(prefs.highFidelity);
      setAutoTitle(prefs.autoTitle);
    })();
  }, []);

  const updateHighFidelity = (value: boolean) => {
    setHighFidelity(value);
    void saveProcessingPreferences({ highFidelity: value, autoTitle });
  };

  const updateAutoTitle = (value: boolean) => {
    setAutoTitle(value);
    void saveProcessingPreferences({ highFidelity, autoTitle: value });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvasMuted }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 28,
            color: colors.foreground,
            letterSpacing: -0.5,
          }}
        >
          Settings
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: colors.foregroundMuted,
            marginTop: 4,
          }}
        >
          Tune how Claridad reads and organizes your notes.
        </Text>

        {/* Plan card */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: colors.foreground,
            borderRadius: radii.md,
            padding: 18,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                <Crown color="#FFFFFF" size={16} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: '#FFFFFF',
                  letterSpacing: -0.2,
                }}
              >
                {isPro ? 'Claridad Pro' : 'Free plan'}
              </Text>
            </View>
            <Pill label={isPro ? 'Active' : '3 / 5 left'} variant="soft" />
          </View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: 'rgba(255,255,255,0.7)',
              marginTop: 12,
              lineHeight: 18,
            }}
          >
            {isPro
              ? 'Unlimited pages, multi-page documents, and high-fidelity organization.'
              : 'Unlock unlimited pages, multi-page documents, and high-fidelity organization with Pro.'}
          </Text>
          {!isPro ? (
            <Pressable
              style={({ pressed }) => ({
                marginTop: 14,
                backgroundColor: pressed ? '#F3F4F6' : '#FFFFFF',
                borderRadius: radii.sm,
                paddingVertical: 11,
                alignItems: 'center',
              })}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: colors.foreground,
                  letterSpacing: -0.2,
                }}
              >
                Upgrade to Pro
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Processing */}
        <View style={{ marginTop: 28 }}>
          <SectionLabel>Processing</SectionLabel>
          <Card>
            <Row
              icon={<Sparkles color={colors.primary} size={16} strokeWidth={2} />}
              label="High-fidelity mode"
              hint="More structure, slower processing"
              trailing={
                <Switch
                  value={highFidelity}
                  onValueChange={updateHighFidelity}
                  trackColor={{ true: colors.primary, false: colors.borderGhost }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <Row
              icon={<FileText color={colors.foreground} size={16} strokeWidth={2} />}
              label="Auto-title sections"
              hint="Generate editorial headings"
              trailing={
                <Switch
                  value={autoTitle}
                  onValueChange={updateAutoTitle}
                  trackColor={{ true: colors.primary, false: colors.borderGhost }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <Row
              icon={<Languages color={colors.foreground} size={16} strokeWidth={2} />}
              label="Language"
              hint="Auto-detect"
              isLast
            />
          </Card>
        </View>

        {/* Account */}
        <View style={{ marginTop: 24 }}>
          <SectionLabel>Account</SectionLabel>
          <Card>
            <Row
              icon={<ShieldCheck color={colors.foreground} size={16} strokeWidth={2} />}
              label="Privacy & data"
            />
            <Row
              icon={<Mail color={colors.foreground} size={16} strokeWidth={2} />}
              label="Email preferences"
              isLast
            />
          </Card>
        </View>

        {/* About */}
        <View style={{ marginTop: 24 }}>
          <SectionLabel>About</SectionLabel>
          <Card>
            <Row
              icon={<HelpCircle color={colors.foreground} size={16} strokeWidth={2} />}
              label="Help center"
            />
            <Row
              icon={<Star color={colors.warning} size={16} strokeWidth={2} />}
              label="Rate Claridad"
              isLast
            />
          </Card>
        </View>

        <View
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              color: colors.foregroundSoft,
            }}
          >
            Preview Pro
          </Text>
          <Switch
            value={isPro}
            onValueChange={(value) => void setPlan(value ? 'pro' : 'free')}
            trackColor={{ true: colors.primary, false: colors.borderGhost }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 0.72 }, { scaleY: 0.72 }] }}
          />
        </View>

        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: colors.foregroundSoft,
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          Claridad · v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
