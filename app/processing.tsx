import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Check, Loader, Sparkles, Layers, FileText, ShieldCheck } from 'lucide-react-native';
import { colors, radii } from '@/constants/theme';
import Pill from '@/components/Pill';
import { clearPendingCaptureUri, consumePendingCaptureUri } from '@/services/pendingCapture';
import { processDocument } from '@/services/documentStore';
import { debugClientLog } from '@/utils/debugClientLog';

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
  const params = useLocalSearchParams<{ image?: string | string[] }>();
  const paramImage = params.image;
  const queryImage = Array.isArray(paramImage) ? paramImage[0] : paramImage;

  const [imageUrl, setImageUrl] = useState(queryImage?.trim() ?? '');

  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

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
    if (queryImage?.trim()) {
      setImageUrl(queryImage.trim());
      return;
    }
    let cancelled = false;
    (async () => {
      const pending = await consumePendingCaptureUri();
      if (cancelled) return;
      if (pending?.trim()) {
        setImageUrl(pending.trim());
      } else {
        setError('No se encontró la imagen a procesar. Vuelve a capturar.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryImage]);

  useEffect(() => {
    if (!imageUrl || submittedRef.current) return;
    submittedRef.current = true;

    (async () => {
      let createdDocId: number | null = null;

      try {
        await debugClientLog('processing.tsx:start', 'processDocument starting', {
          imageUrlLen: imageUrl.length,
          imageUrlPrefix: imageUrl.slice(0, 28),
        }, 'B');
        const document = await processDocument(imageUrl);
        createdDocId = document.id;

        await clearPendingCaptureUri();

        await new Promise((r) => setTimeout(r, 800));

        setCompletedStages([0, 1, 2, 3]);
        setActiveStage(STAGES.length);

        setTimeout(() => {
          router.replace(`/document/${createdDocId}?fresh=1`);
        }, 600);
      } catch (e) {
        if (createdDocId) {
          router.replace(`/document/${createdDocId}?fresh=1`);
          return;
        }

        console.error('Processing error:', e);
        await debugClientLog('processing.tsx:catch', 'processDocument failed', {
          errorName: e instanceof Error ? e.name : 'unknown',
          errorMessage: e instanceof Error ? e.message : String(e),
          errorStack: e instanceof Error ? (e.stack ?? '').slice(0, 200) : null,
        }, 'F');
        const raw = e instanceof Error ? (e.message || e.stack || String(e)) : String(e);
        let msg = raw.split('\n')[0] || 'Algo salió mal al procesar la foto.';
        if (raw.includes('EXPO_PUBLIC_API_URL') || raw.includes('API no configurada')) {
          msg = 'La API de procesamiento no está configurada. Añade EXPO_PUBLIC_API_URL.';
        } else if (raw.includes('Failed to fetch') || raw.includes('Network request failed')) {
          msg =
            'No se pudo conectar al proxy. En local, ejecuta `npm run dev:api` en el Mac y usa la misma Wi‑Fi.';
        } else if (raw.includes('image_url is required') || raw.includes('Could not read')) {
          msg = 'No se pudo leer la imagen. Vuelve a capturar la foto.';
        } else if (raw.includes('QuotaExceededError') || raw.includes('quota')) {
          msg = 'La imagen es demasiado grande para guardar en el navegador. Prueba con otra foto.';
        } else if (raw.includes('INVALID_ARGUMENT') || raw.includes('Unable to process input image')) {
          msg = 'Gemini no pudo leer la imagen. Prueba con otra foto.';
        } else if (raw.includes('processImageWithGemini') || raw.includes('entry.bundle')) {
          msg = 'Error al procesar con Gemini. Comprueba que npm run dev:api está corriendo en el Mac.';
        }
        setError(msg);
      }
    })();
  }, [imageUrl, router]);

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
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
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
                  <Loader color={colors.primary} size={14} strokeWidth={2.4} />
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

      <View
        style={{
          marginTop: 24,
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
      </ScrollView>
    </View>
  );
}
