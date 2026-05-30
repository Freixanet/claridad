import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  X,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  Layers,
  RefreshCw,
} from 'lucide-react-native';
import { colors, radii } from '@/constants/theme';
import Pill from '@/components/Pill';
import useUpload from '@/utils/useUpload';
import { setPendingCaptureUri } from '@/services/pendingCapture';
import { ensureStableImageUri } from '@/services/imageToBase64';
import { compressDataUriForWeb } from '@/services/webImageCache';
import { goBackOr } from '@/utils/navigation';
import { useScrollViewsToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

type Step = 'intent' | 'preview';

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState<Step>('intent');
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [upload] = useUpload();
  const submittingRef = useRef(false);
  const assignScrollRef = useScrollViewsToTopOnFocus<Step>();

  const pickFromCamera = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Camera access needed',
          'Claridad needs camera permission to capture your notes.'
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        base64: Platform.OS === 'web',
      });
      if (!result.canceled && result.assets[0]) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        setSelectedAsset(result.assets[0]);
        setStep('preview');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert("Couldn't open camera", 'Please try again.');
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        base64: Platform.OS === 'web',
      });
      if (!result.canceled && result.assets[0]) {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync().catch(() => {});
        }
        setSelectedAsset(result.assets[0]);
        setStep('preview');
      }
    } catch (error) {
      console.error('Library error:', error);
      Alert.alert("Couldn't open library", 'Please try again.');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedAsset || submittingRef.current) return;
    submittingRef.current = true;
    setBusy(true);
    try {
      const uploaded = await upload({ reactNativeAsset: selectedAsset });
      if ('error' in uploaded || !uploaded.url) {
        throw new Error(uploaded.error ?? 'Upload failed');
      }
      const stableUri =
        Platform.OS === 'web'
          ? await compressDataUriForWeb(await ensureStableImageUri(uploaded.url))
          : uploaded.url;
      await setPendingCaptureUri(stableUri);
      router.replace('/processing');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Please try again.');
      setBusy(false);
      submittingRef.current = false;
    }
  }, [selectedAsset, upload, router]);

  const handleClose = useCallback(() => {
    goBackOr(router, '/');
  }, [router]);

  if (step === 'preview' && selectedAsset) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderGhost,
          }}
        >
          <Pressable
            onPress={() => {
              setStep('intent');
              setSelectedAsset(null);
            }}
            hitSlop={10}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              backgroundColor: pressed ? colors.canvasMuted : colors.background,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <RefreshCw color={colors.foreground} size={16} strokeWidth={2} />
          </Pressable>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 15,
              color: colors.foreground,
              letterSpacing: -0.2,
            }}
          >
            Review capture
          </Text>
          <Pressable
            onPress={handleClose}
            hitSlop={10}
            disabled={busy}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              backgroundColor: pressed ? colors.canvasMuted : colors.background,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.4 : 1,
            })}
          >
            <X color={colors.foreground} size={16} strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView
          ref={assignScrollRef('preview')}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: colors.canvasMuted,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              padding: 10,
            }}
          >
            <Image
              source={{ uri: selectedAsset.uri }}
              style={{
                width: '100%',
                aspectRatio:
                  selectedAsset.width && selectedAsset.height
                    ? selectedAsset.width / selectedAsset.height
                    : 3 / 4,
                borderRadius: radii.sm,
                backgroundColor: colors.canvasMuted,
              }}
              contentFit="contain"
              transition={200}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
            <Pill label="Source image" />
            <Pill label="Ready to organize" dotColor={colors.success} />
          </View>

          {/* What happens next */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: colors.background,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sparkles color={colors.primary} size={15} strokeWidth={2.2} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: colors.foreground,
                  letterSpacing: -0.1,
                }}
              >
                What Claridad will do
              </Text>
            </View>
            <View style={{ marginTop: 12, gap: 6 }}>
              {[
                'Read every line of handwriting',
                'Group fragments that share a topic',
                'Title each group editorially',
                'Keep your words — never invent content',
              ].map((line) => (
                <View key={line} style={{ flexDirection: 'row' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 13,
                      color: colors.foregroundSoft,
                      width: 14,
                    }}
                  >
                    -
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 13,
                      color: colors.foregroundMuted,
                      flex: 1,
                      lineHeight: 19,
                    }}
                  >
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={{
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              backgroundColor: colors.primarySoft,
              borderRadius: radii.sm,
              padding: 12,
              borderWidth: 1,
              borderColor: '#DBEAFE',
            }}
          >
            <ShieldCheck
              color={colors.primary}
              size={15}
              strokeWidth={2.2}
              style={{ marginTop: 1 }}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: 'Inter_400Regular',
                fontSize: 12.5,
                color: colors.primary,
                lineHeight: 18,
              }}
            >
              You'll be able to compare the result against this photo in the Review tab to verify
              fidelity.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.borderGhost,
          }}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={busy}
            style={({ pressed }) => ({
              backgroundColor: busy ? colors.foregroundSoft : pressed ? '#1E40AF' : colors.primary,
              borderRadius: radii.sm,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            })}
          >
            {busy ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    color: '#FFFFFF',
                    letterSpacing: -0.2,
                  }}
                >
                  Uploading…
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    color: '#FFFFFF',
                    letterSpacing: -0.2,
                  }}
                >
                  Organize this page
                </Text>
                <ArrowRight color="#FFFFFF" size={16} strokeWidth={2.4} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Intent step
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ width: 36 }} />
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 15,
            color: colors.foreground,
            letterSpacing: -0.2,
          }}
        >
          New capture
        </Text>
        <Pressable
          onPress={handleClose}
          hitSlop={10}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            backgroundColor: pressed ? colors.canvasMuted : colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <X color={colors.foreground} size={16} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        ref={assignScrollRef('intent')}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={{
            marginTop: 8,
            backgroundColor: colors.canvasMuted,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            padding: 22,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pill label="Step 1 of 3" variant="soft" />
            <Text
              style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.foregroundMuted }}
            >
              Capture → Process → Review
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 24,
              color: colors.foreground,
              marginTop: 14,
              letterSpacing: -0.5,
              lineHeight: 30,
            }}
          >
            Photograph the page{'\n'}you want to organize.
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13.5,
              color: colors.foregroundMuted,
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            Place the notebook on a flat surface with good light. Claridad handles arrows, crossouts
            and mixed topics.
          </Text>
        </View>

        {/* Primary actions */}
        <View style={{ marginTop: 18, gap: 10 }}>
          <Pressable
            onPress={pickFromCamera}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#1E40AF' : colors.primary,
              borderRadius: radii.md,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            })}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera color="#FFFFFF" size={20} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: '#FFFFFF',
                  letterSpacing: -0.2,
                }}
              >
                Take a photo
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12.5,
                  color: 'rgba(255,255,255,0.75)',
                  marginTop: 2,
                }}
              >
                Use the camera with auto-crop guides
              </Text>
            </View>
            <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            onPress={pickFromLibrary}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.canvasMuted : colors.background,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            })}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: colors.canvasMuted,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon color={colors.foreground} size={20} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: colors.foreground,
                  letterSpacing: -0.2,
                }}
              >
                Choose from library
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12.5,
                  color: colors.foregroundMuted,
                  marginTop: 2,
                }}
              >
                Pick an existing photo of your notes
              </Text>
            </View>
            <ArrowRight color={colors.foregroundMuted} size={18} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Principles section */}
        <Text
          style={{
            marginTop: 28,
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: colors.foregroundMuted,
            paddingHorizontal: 4,
          }}
        >
          How Claridad works
        </Text>

        <View style={{ marginTop: 10, gap: 8 }}>
          {[
            {
              icon: <Layers color={colors.foreground} size={16} strokeWidth={2.2} />,
              title: 'Groups by topic',
              body: 'Mixes of work, errands and notes are separated into distinct sections.',
            },
            {
              icon: <Sparkles color={colors.primary} size={16} strokeWidth={2.2} />,
              title: 'Titles editorially',
              body: "Each section gets a short, descriptive heading you didn't write.",
            },
            {
              icon: <ShieldCheck color={colors.success} size={16} strokeWidth={2.2} />,
              title: 'Fidelity guaranteed',
              body: 'Claridad reorganizes — it never adds content or changes meaning.',
            },
            {
              icon: <Eye color={colors.foreground} size={16} strokeWidth={2.2} />,
              title: 'Review mode',
              body: 'Compare the structured result against your original photo, side by side.',
            },
          ].map((item) => (
            <View
              key={item.title}
              style={{
                backgroundColor: colors.background,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                padding: 14,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.canvasMuted,
                  borderWidth: 1,
                  borderColor: colors.borderGhost,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 13.5,
                    color: colors.foreground,
                    letterSpacing: -0.1,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12.5,
                    color: colors.foregroundMuted,
                    marginTop: 2,
                    lineHeight: 18,
                  }}
                >
                  {item.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
