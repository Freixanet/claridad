import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Check, Loader, Sparkles, Layers, FileText, ShieldCheck } from 'lucide-react-native';
import { colors, radii } from '@/constants/theme';
import Pill from '@/components/Pill';
import { apiFetch } from '@/api/client';
import { consumePendingCaptureUri } from '@/services/pendingCapture';

type Stage = {
  key: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
};

const STAGES: Stage[] = [
  {
    key: 'read',
    label: 'Reading your handwriting',
    detail: 'Recognizing every line and fragment',
    icon: <Sparkles color={colors.primary} size={14} strokeWidth={2.4} />,
  },
  {
    key: 'group',
    label: 'Grouping by topic',
    detail: 'Detecting what belongs together',
    icon: <Layers color={colors.primary} size={14} strokeWidth={2.4} />,
  },
  {
    key: 'title',
    label: 'Titling each section',
    detail: 'Adding editorial headings',
    icon: <FileText color={colors.primary} size={14} strokeWidth={2.4} />,
  },
  {
    key: 'verify',
    label: 'Verifying fidelity',
    detail: 'Confirming nothing was invented',
    icon: <ShieldCheck color={colors.primary} size={14} strokeWidth={2.4} />,
  },
];

export default function ProcessingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ image?: string; session?: string }>();

  const resolveParam = (value: string | string[] | undefined): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value[0]) return value[0];
    return '';
  };

  const [imageUrl, setImageUrl] = useState('');
  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const submittedRef = useRef(false);

  // Pick up the capture URI when the screen is shown (native remounts / Strict Mode
  // can clear an eager consume in useState before processing runs).
  useFocusEffect(
    useCallback(() => {
      const fromStore = consumePendingCaptureUri();
      const fromParams = resolveParam(params.image);
      const uri = fromStore || fromParams;
      if (!uri) return;

      setImageUrl(uri);
      setError(null);
      setActiveStage(0);
      setCompletedStages([]);
      submittedRef.current = false;
    }, [params.image, params.session])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    // Stage progress simulation
    const timers: ReturnType<typeof setTimeout>[] = [];
    STAGES.forEach((_, idx) => {
      if (idx === 0) return;
      const timer = setTimeout(() => {
        setCompletedStages((prev) => [...prev, idx - 1]);
        setActiveStage(idx);
      }, idx * 2400);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!imageUrl || submittedRef.current) return;
    submittedRef.current = true;

    (async () => {
      try {
        const res = await apiFetch('/api/documents/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: imageUrl }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Failed (${res.status})`);
        }
        const data = await res.json();
        const docId = data?.document?.id;
        if (!docId) throw new Error('No document returned');

        // Ensure minimum theatrical delay
        await new Promise((r) => setTimeout(r, 800));

        // Mark all stages complete
        setCompletedStages([0, 1, 2, 3]);
        setActiveStage(STAGES.length);

        setTimeout(() => {
          router.replace(`/document/${docId}?fresh=1`);
        }, 600);
      } catch (e) {
        console.error('Processing error:', e);
        const msg = e instanceof Error ? e.message : 'Something went wrong';
        setError(msg);
      }
    })();
  }, [imageUrl, router]);

  useEffect(() => {
    if (imageUrl || error) return;
    const timer = setTimeout(() => {
      if (!imageUrl && !submittedRef.current) {
        setError('No encontramos la foto capturada. Vuelve a capturar la página.');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [imageUrl, error, params.session]);

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 22,
            color: colors.foreground,
            letterSpacing: -0.4,
          }}
        >
          Couldn't organize this page
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: colors.foregroundMuted,
            marginTop: 8,
            lineHeight: 20,
          }}
        >
          {error}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? colors.canvasMuted : colors.background,
              borderRadius: radii.sm,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.borderGhost,
            })}
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.foreground }}>
              Back to library
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/capture')}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? '#1E40AF' : colors.primary,
              borderRadius: radii.sm,
              paddingVertical: 12,
              alignItems: 'center',
            })}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>
              Try again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.canvasMuted,
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
      }}
    >
      {/* Top brand */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            color: colors.foregroundMuted,
            letterSpacing: 0.2,
          }}
        >
          PROCESSING
        </Text>
      </View>

      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 28,
          color: colors.foreground,
          marginTop: 14,
          letterSpacing: -0.6,
          lineHeight: 34,
        }}
      >
        Organizing your page{'\n'}into clean sections.
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          color: colors.foregroundMuted,
          marginTop: 6,
          lineHeight: 20,
        }}
      >
        This takes a few seconds. We'll show your document as soon as it's ready.
      </Text>

      {/* Preview thumbnail */}
      <View
        style={{
          marginTop: 22,
          backgroundColor: colors.background,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.borderGhost,
          padding: 12,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 58,
            height: 74,
            borderRadius: radii.sm,
            backgroundColor: colors.canvasMuted,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              color: colors.foreground,
              letterSpacing: -0.1,
            }}
          >
            Source page
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: colors.foregroundMuted,
              marginTop: 2,
            }}
          >
            Being analyzed by Claridad
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Pill label="Editorial mode" variant="soft" />
          </View>
        </View>
      </View>

      {/* Stages */}
      <View
        style={{
          marginTop: 18,
          backgroundColor: colors.background,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.borderGhost,
          padding: 4,
        }}
      >
        {STAGES.map((stage, idx) => {
          const isDone = completedStages.includes(idx);
          const isActive = activeStage === idx && !isDone;
          const isPending = !isDone && !isActive;
          const isLast = idx === STAGES.length - 1;

          return (
            <View
              key={stage.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: colors.borderGhost,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isDone
                    ? colors.success
                    : isActive
                      ? colors.primary
                      : colors.borderGhost,
                  backgroundColor: isDone
                    ? '#DCFCE7'
                    : isActive
                      ? colors.primarySoft
                      : colors.canvasMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? (
                  <Check color={colors.success} size={14} strokeWidth={2.5} />
                ) : isActive ? (
                  <Animated.View
                    style={{
                      opacity: pulseOpacity,
                    }}
                  >
                    <Loader color={colors.primary} size={14} strokeWidth={2.4} />
                  </Animated.View>
                ) : (
                  stage.icon
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: isActive || isDone ? 'Inter_500Medium' : 'Inter_400Regular',
                    fontSize: 13.5,
                    color: isPending ? colors.foregroundMuted : colors.foreground,
                    letterSpacing: -0.1,
                  }}
                >
                  {stage.label}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: colors.foregroundMuted,
                    marginTop: 1,
                  }}
                >
                  {stage.detail}
                </Text>
              </View>

              {isActive ? <Pill label="Now" variant="soft" /> : null}
              {isDone ? <Pill label="Done" dotColor={colors.success} /> : null}
            </View>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <View
        style={{
          marginBottom: insets.bottom + 16,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11.5,
            color: colors.foregroundSoft,
            textAlign: 'center',
            lineHeight: 17,
          }}
        >
          Claridad reorganizes your notes, it never invents{'\n'}content. You can verify in Review
          mode.
        </Text>
      </View>
    </View>
  );
}
