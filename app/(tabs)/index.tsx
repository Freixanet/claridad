import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Sparkles,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  FileText,
  Pin,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { colors, radii } from '@/constants/theme';
import Pill from '@/components/Pill';

type DocumentRow = {
  id: number;
  title: string;
  source_image_url: string;
  topic_count: number;
  word_count: number;
  status: string;
  pinned: boolean;
  created_at: string;
};

const FILTERS = ['All', 'Recent', 'Pinned'] as const;
type FilterKey = (typeof FILTERS)[number];

function formatRelative(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day === 1) return 'yesterday';
    if (day < 7) return `${day}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function EmptyState({ onCapture }: { onCapture: () => void }) {
  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: colors.background,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.borderGhost,
        padding: 24,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: colors.primarySoft,
          borderWidth: 1,
          borderColor: '#DBEAFE',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sparkles color={colors.primary} size={20} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 17,
          color: colors.foreground,
          marginTop: 14,
          letterSpacing: -0.2,
        }}
      >
        Your library is empty
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: colors.foregroundMuted,
          marginTop: 4,
          lineHeight: 19,
        }}
      >
        Photograph a messy page of notes and Claridad will reorganize it into clean, titled sections
        by topic.
      </Text>
      <View style={{ marginTop: 14, gap: 4 }}>
        <Text
          style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.foregroundMuted }}
        >
          <Text style={{ color: colors.foregroundSoft }}>{'-  '}</Text>One photo, one document
        </Text>
        <Text
          style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.foregroundMuted }}
        >
          <Text style={{ color: colors.foregroundSoft }}>{'-  '}</Text>Grouped by topic, titled for
          you
        </Text>
        <Text
          style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.foregroundMuted }}
        >
          <Text style={{ color: colors.foregroundSoft }}>{'-  '}</Text>Faithful — never invents
          content
        </Text>
      </View>
      <Pressable
        onPress={onCapture}
        style={({ pressed }) => ({
          marginTop: 18,
          backgroundColor: pressed ? '#1E40AF' : colors.primary,
          borderRadius: radii.sm,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        })}
      >
        <Plus color="#FFFFFF" size={16} strokeWidth={2.4} />
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: '#FFFFFF',
            letterSpacing: -0.1,
          }}
        >
          Capture a note
        </Text>
      </Pressable>
    </View>
  );
}

function HeroIntro({ onCapture }: { onCapture: () => void }) {
  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.borderGhost,
        padding: 18,
        marginTop: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pill
          label="New"
          variant="soft"
          icon={<Sparkles color={colors.primary} size={11} strokeWidth={2.4} />}
        />
        <Text
          style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.foregroundMuted }}
        >
          Editorial organization, not transcription
        </Text>
      </View>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 22,
          color: colors.foreground,
          marginTop: 14,
          letterSpacing: -0.4,
          lineHeight: 28,
        }}
      >
        From a chaotic page{'\n'}to a structured document.
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: colors.foregroundMuted,
          marginTop: 8,
          lineHeight: 19,
        }}
      >
        Snap a handwritten page. Claridad groups fragments by topic and gives each one a title —
        without rewording you.
      </Text>
      <Pressable
        onPress={onCapture}
        style={({ pressed }) => ({
          marginTop: 16,
          backgroundColor: pressed ? '#1E40AF' : colors.primary,
          borderRadius: radii.sm,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        })}
      >
        <Plus color="#FFFFFF" size={16} strokeWidth={2.4} />
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: '#FFFFFF',
            letterSpacing: -0.1,
          }}
        >
          Capture your first page
        </Text>
      </Pressable>
    </View>
  );
}

function DocCard({ doc, onPress }: { doc: DocumentRow; onPress: () => void }) {
  const dateLabel = formatRelative(doc.created_at);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.background,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: pressed ? colors.borderStrong : colors.borderGhost,
        padding: 14,
        flexDirection: 'row',
        gap: 12,
      })}
    >
      <View
        style={{
          width: 60,
          height: 76,
          borderRadius: radii.sm,
          backgroundColor: colors.canvasMuted,
          borderWidth: 1,
          borderColor: colors.borderGhost,
          overflow: 'hidden',
        }}
      >
        {doc.source_image_url ? (
          <Image
            source={{ uri: doc.source_image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={120}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon color={colors.foregroundSoft} size={20} strokeWidth={1.8} />
          </View>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {doc.pinned ? (
              <Pin color={colors.warning} size={11} strokeWidth={2.4} fill={colors.warning} />
            ) : null}
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 15,
                color: colors.foreground,
                letterSpacing: -0.2,
                flex: 1,
              }}
            >
              {doc.title}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
            <Pill
              label={`${doc.topic_count} ${doc.topic_count === 1 ? 'topic' : 'topics'}`}
              icon={<Layers color={colors.foreground} size={10} strokeWidth={2.2} />}
            />
            <Pill
              label={`${doc.word_count}w`}
              icon={<FileText color={colors.foreground} size={10} strokeWidth={2.2} />}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
          }}
        >
          <Text
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.foregroundMuted }}
          >
            {dateLabel}
          </Text>
          <ArrowRight color={colors.foregroundSoft} size={14} strokeWidth={2} />
        </View>
      </View>
    </Pressable>
  );
}

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.borderGhost,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 20,
          color: colors.foreground,
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          color: colors.foregroundMuted,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery<{ documents: DocumentRow[] }>({
    queryKey: ['documents', filter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (filter === 'Pinned') params.set('pinned', 'true');
      const res = await fetch(`/api/documents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load documents');
      return res.json();
    },
  });

  const documents = useMemo(() => data?.documents ?? [], [data]);

  const totals = useMemo(() => {
    const totalTopics = documents.reduce((acc, d) => acc + d.topic_count, 0);
    const totalWords = documents.reduce((acc, d) => acc + d.word_count, 0);
    return {
      pages: documents.length,
      topics: totalTopics,
      words: totalWords,
    };
  }, [documents]);

  const openCapture = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    router.push('/capture');
  }, [router]);

  const openDoc = useCallback(
    (id: number) => {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {});
      }
      router.push(`/document/${id}`);
    },
    [router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvasMuted }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.foregroundMuted}
          />
        }
      >
        {/* Brand row */}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: colors.foreground,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  color: '#FFFFFF',
                  fontSize: 14,
                  letterSpacing: -0.4,
                }}
              >
                C
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 17,
                color: colors.foreground,
                letterSpacing: -0.3,
              }}
            >
              Claridad
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
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
            <Text
              style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.foreground }}
            >
              JC
            </Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 30,
              color: colors.foreground,
              letterSpacing: -0.7,
              lineHeight: 36,
            }}
          >
            Library
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.foregroundMuted,
              marginTop: 4,
            }}
          >
            Notes you photographed, organized by topic.
          </Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
          <StatChip value={totals.pages} label="Pages" />
          <StatChip value={totals.topics} label="Topics" />
          <StatChip value={totals.words.toLocaleString()} label="Words" />
        </View>

        {/* Search */}
        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            borderRadius: radii.sm,
            paddingHorizontal: 12,
            height: 42,
          }}
        >
          <Search color={colors.foregroundMuted} size={16} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search notes and topics"
            placeholderTextColor={colors.foregroundSoft}
            style={{
              flex: 1,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.foreground,
              padding: 0,
            }}
            returnKeyType="search"
          />
        </View>

        {/* Filter tabs */}
        <View
          style={{
            marginTop: 18,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderGhost,
          }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  marginRight: 22,
                  paddingBottom: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: active ? colors.primary : 'transparent',
                  marginBottom: -1,
                }}
              >
                <Text
                  style={{
                    fontFamily: active ? 'Inter_500Medium' : 'Inter_400Regular',
                    fontSize: 14,
                    color: active ? colors.foreground : colors.foregroundMuted,
                    letterSpacing: -0.1,
                  }}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.foregroundMuted} />
          </View>
        ) : documents.length === 0 && !search ? (
          <>
            <View style={{ marginTop: 18 }}>
              <HeroIntro onCapture={openCapture} />
            </View>
            <EmptyState onCapture={openCapture} />
          </>
        ) : documents.length === 0 ? (
          <View
            style={{
              marginTop: 18,
              paddingVertical: 32,
              alignItems: 'center',
              backgroundColor: colors.background,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderGhost,
            }}
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.foreground }}>
              No matches for "{search}"
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: colors.foregroundMuted,
                marginTop: 4,
              }}
            >
              Try a different keyword or topic
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 16, gap: 10 }}>
            {documents.map((doc) => (
              <DocCard key={doc.id} doc={doc} onPress={() => openDoc(doc.id)} />
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
