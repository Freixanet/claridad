import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { X, ShieldCheck, FileText, Image as ImageIcon, Eye } from 'lucide-react-native';
import { Image } from 'expo-image';
import { colors, radii, categoryMeta } from '@/constants/theme';
import Pill from '@/components/Pill';

type Section = {
  id: string;
  title: string;
  category: string;
  content: string;
  items: string[];
  source_excerpt: string;
};

type DocumentDetail = {
  id: number;
  title: string;
  source_image_url: string;
  raw_transcription: string;
  sections: Section[];
  topic_count: number;
  word_count: number;
};

type Mode = 'split' | 'source' | 'structured';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const docId = params.id;
  const [mode, setMode] = useState<Mode>('split');

  const { data, isLoading } = useQuery<{ document: DocumentDetail }>({
    queryKey: ['document', docId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: Boolean(docId),
  });

  const doc = data?.document;
  const screenWidth = Dimensions.get('window').width;

  if (isLoading || !doc) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.foregroundMuted} />
      </View>
    );
  }

  const modes: { key: Mode; label: string; icon: React.ReactNode }[] = [
    {
      key: 'split',
      label: 'Split',
      icon: (
        <Eye
          color={mode === 'split' ? colors.foreground : colors.foregroundMuted}
          size={13}
          strokeWidth={2.2}
        />
      ),
    },
    {
      key: 'source',
      label: 'Original',
      icon: (
        <ImageIcon
          color={mode === 'source' ? colors.foreground : colors.foregroundMuted}
          size={13}
          strokeWidth={2.2}
        />
      ),
    },
    {
      key: 'structured',
      label: 'Structured',
      icon: (
        <FileText
          color={mode === 'structured' ? colors.foreground : colors.foregroundMuted}
          size={13}
          strokeWidth={2.2}
        />
      ),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvasMuted }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderGhost,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              color: colors.foregroundMuted,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            Review mode
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 15,
              color: colors.foreground,
              letterSpacing: -0.2,
              marginTop: 2,
            }}
          >
            {doc.title}
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
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

      {/* Mode switcher */}
      <View
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderGhost,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.canvasMuted,
            borderRadius: radii.sm,
            padding: 3,
            borderWidth: 1,
            borderColor: colors.borderGhost,
          }}
        >
          {modes.map((m) => {
            const active = mode === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 6,
                  backgroundColor: active ? colors.background : 'transparent',
                  borderWidth: active ? 1 : 0,
                  borderColor: colors.borderGhost,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                {m.icon}
                <Text
                  style={{
                    fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    fontSize: 12.5,
                    color: active ? colors.foreground : colors.foregroundMuted,
                    letterSpacing: -0.1,
                  }}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Pill
            label="Fidelity verified"
            dotColor={colors.success}
            icon={<ShieldCheck color={colors.success} size={11} strokeWidth={2.2} />}
          />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11.5,
              color: colors.foregroundMuted,
              flex: 1,
            }}
          >
            Compare structure against your original
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'split' ? (
          <View style={{ gap: 14 }}>
            {/* Side-by-side label row */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 11,
                    color: colors.foregroundMuted,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  Original
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 11,
                    color: colors.foregroundMuted,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  Structured
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Source */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.borderGhost,
                  padding: 8,
                }}
              >
                <Image
                  source={{ uri: doc.source_image_url }}
                  style={{
                    width: '100%',
                    aspectRatio: 3 / 4,
                    borderRadius: radii.sm,
                    backgroundColor: colors.canvasMuted,
                  }}
                  contentFit="cover"
                />
              </View>

              {/* Structured preview */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.borderGhost,
                  padding: 10,
                  gap: 6,
                }}
              >
                {doc.sections.slice(0, 4).map((s) => {
                  const meta = categoryMeta[s.category] ?? categoryMeta.other;
                  return (
                    <View
                      key={s.id}
                      style={{
                        paddingBottom: 6,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderGhost,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: meta.dot,
                          }}
                        />
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 11,
                            color: colors.foreground,
                            letterSpacing: -0.1,
                            flex: 1,
                          }}
                        >
                          {s.title}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 9.5,
                          color: colors.foregroundMuted,
                          marginTop: 3,
                          lineHeight: 13,
                        }}
                      >
                        {s.content || (s.items && s.items[0]) || ''}
                      </Text>
                    </View>
                  );
                })}
                {doc.sections.length > 4 ? (
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 10,
                      color: colors.foregroundMuted,
                      textAlign: 'center',
                    }}
                  >
                    + {doc.sections.length - 4} more
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Detail list below */}
            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: colors.foregroundMuted,
                  marginBottom: 10,
                }}
              >
                Section-by-section
              </Text>
              <View style={{ gap: 10 }}>
                {doc.sections.map((s, i) => {
                  const meta = categoryMeta[s.category] ?? categoryMeta.other;
                  return (
                    <View
                      key={s.id || i}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: radii.md,
                        borderWidth: 1,
                        borderColor: colors.borderGhost,
                        padding: 14,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pill label={meta.label} dotColor={meta.dot} />
                        <Text
                          style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: 11,
                            color: colors.foregroundSoft,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 15,
                          color: colors.foreground,
                          marginTop: 8,
                          letterSpacing: -0.2,
                        }}
                      >
                        {s.title}
                      </Text>
                      {s.source_excerpt ? (
                        <View
                          style={{
                            marginTop: 10,
                            paddingLeft: 10,
                            borderLeftWidth: 2,
                            borderLeftColor: colors.borderStrong,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'Inter_500Medium',
                              fontSize: 10.5,
                              color: colors.foregroundSoft,
                              letterSpacing: 0.4,
                              textTransform: 'uppercase',
                              marginBottom: 4,
                            }}
                          >
                            From your page
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Inter_400Regular',
                              fontSize: 12.5,
                              color: colors.foregroundMuted,
                              lineHeight: 18,
                              fontStyle: 'italic',
                            }}
                          >
                            "{s.source_excerpt}"
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        {mode === 'source' ? (
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              padding: 10,
            }}
          >
            <Image
              source={{ uri: doc.source_image_url }}
              style={{
                width: screenWidth - 52,
                aspectRatio: 3 / 4,
                borderRadius: radii.sm,
                backgroundColor: colors.canvasMuted,
              }}
              contentFit="contain"
            />
            {doc.raw_transcription ? (
              <View
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: colors.canvasMuted,
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: colors.borderGhost,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 11,
                    color: colors.foregroundMuted,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Raw transcription
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12.5,
                    color: colors.foreground,
                    lineHeight: 19,
                  }}
                >
                  {doc.raw_transcription}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {mode === 'structured' ? (
          <View style={{ gap: 10 }}>
            {doc.sections.map((s, i) => {
              const meta = categoryMeta[s.category] ?? categoryMeta.other;
              return (
                <View
                  key={s.id || i}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: radii.md,
                    borderWidth: 1,
                    borderColor: colors.borderGhost,
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pill label={meta.label} dotColor={meta.dot} />
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 11,
                        color: colors.foregroundSoft,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 16,
                      color: colors.foreground,
                      marginTop: 10,
                      letterSpacing: -0.2,
                    }}
                  >
                    {s.title}
                  </Text>
                  {s.content ? (
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 13.5,
                        color: '#374151',
                        marginTop: 8,
                        lineHeight: 20,
                      }}
                    >
                      {s.content}
                    </Text>
                  ) : null}
                  {s.items && s.items.length > 0 ? (
                    <View style={{ marginTop: 8, gap: 4 }}>
                      {s.items.map((item, idx) => (
                        <View key={idx} style={{ flexDirection: 'row' }}>
                          <Text
                            style={{
                              fontFamily: 'Inter_400Regular',
                              fontSize: 13.5,
                              color: colors.foregroundSoft,
                              width: 14,
                            }}
                          >
                            -
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              fontFamily: 'Inter_400Regular',
                              fontSize: 13.5,
                              color: '#374151',
                              lineHeight: 20,
                            }}
                          >
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
