import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Eye,
  Download,
  Pin,
  Trash2,
  Sparkles,
  Layers,
  FileText,
  Copy,
  CheckCircle2,
} from 'lucide-react-native';
import { colors, radii } from '@/constants/theme';
import { useCustomTopics } from '@/hooks/useCustomTopics';
import { getTopicMeta } from '@/utils/topicCatalog';
import Pill from '@/components/Pill';
import OrganizedSectionList from '@/components/OrganizedSectionList';
import { copyTextToClipboard } from '@/utils/copyToClipboard';
import { goBackOr } from '@/utils/navigation';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

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
  status: string;
  pinned: boolean;
  created_at: string;
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function DocumentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string; fresh?: string }>();
  const docId = params.id;
  const isFresh = params.fresh === '1';
  const [justCopied, setJustCopied] = useState(false);

  const { data, isLoading, error } = useQuery<{ document: DocumentDetail }>({
    queryKey: ['document', docId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) throw new Error('Failed to fetch document');
      return res.json();
    },
    enabled: Boolean(docId),
  });

  const doc = data?.document;

  const pinMutation = useMutation({
    mutationFn: async (pinned: boolean) => {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', docId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      router.replace('/');
    },
  });

  const handlePin = useCallback(() => {
    if (!doc) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    pinMutation.mutate(!doc.pinned);
  }, [doc, pinMutation]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete document?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  }, [deleteMutation]);

  const { catalog } = useCustomTopics();

  const markdown = useMemo(() => {
    if (!doc) return '';
    const lines: string[] = [`# ${doc.title}`, ''];
    doc.sections.forEach((s) => {
      const meta = getTopicMeta(s.category, catalog);
      lines.push(`## ${s.title}`);
      lines.push(`*${meta.label}*`);
      lines.push('');
      if (s.content) {
        lines.push(s.content);
        lines.push('');
      }
      if (s.items && s.items.length > 0) {
        s.items.forEach((i) => lines.push(`- ${i}`));
        lines.push('');
      }
    });
    return lines.join('\n');
  }, [catalog, doc]);

  const handleCopy = useCallback(async () => {
    if (!markdown) return;
    const copied = await copyTextToClipboard(markdown);
    if (!copied) {
      Alert.alert(
        'No se pudo copiar',
        'En Safari sobre http:// no está disponible el portapapeles. Usa Export → Share.'
      );
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1800);
  }, [markdown]);

  if (isLoading) {
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

  if (error || !doc) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.foreground }}>
          Document not found
        </Text>
        <Pressable
          onPress={() => router.replace('/')}
          style={({ pressed }) => ({
            marginTop: 16,
            alignSelf: 'flex-start',
            backgroundColor: pressed ? colors.canvasMuted : colors.background,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            paddingVertical: 10,
            paddingHorizontal: 14,
          })}
        >
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.foreground }}>
            Back to library
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvasMuted }}>
      {/* Sticky header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderGhost,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Pressable
          onPress={() => goBackOr(router, '/')}
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
          <ChevronLeft color={colors.foreground} size={18} strokeWidth={2.2} />
        </Pressable>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 12,
              color: colors.foregroundMuted,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            Document
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pressable
            onPress={handlePin}
            hitSlop={10}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: doc.pinned ? colors.warning : colors.borderGhost,
              backgroundColor: doc.pinned
                ? '#FFF7ED'
                : pressed
                  ? colors.canvasMuted
                  : colors.background,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Pin
              color={doc.pinned ? colors.warning : colors.foreground}
              size={15}
              strokeWidth={2.2}
              fill={doc.pinned ? colors.warning : 'transparent'}
            />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/review/${docId}`)}
            hitSlop={10}
            style={({ pressed }) => ({
              height: 36,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              backgroundColor: pressed ? colors.canvasMuted : colors.background,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 5,
              paddingHorizontal: 10,
            })}
          >
            <Eye color={colors.foreground} size={14} strokeWidth={2.2} />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12.5,
                color: colors.foreground,
                letterSpacing: -0.1,
              }}
            >
              Review
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Fresh success ribbon */}
        {isFresh ? (
          <View
            style={{
              backgroundColor: '#F0FDF4',
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: '#BBF7D0',
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 color={colors.success} size={16} strokeWidth={2.2} />
            <Text
              style={{
                flex: 1,
                fontFamily: 'Inter_500Medium',
                fontSize: 13,
                color: '#166534',
                letterSpacing: -0.1,
              }}
            >
              Done — organized into {doc.topic_count} {doc.topic_count === 1 ? 'topic' : 'topics'}.
            </Text>
          </View>
        ) : null}

        {/* Title block */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Pill
              label="Organized"
              variant="soft"
              icon={<Sparkles color={colors.primary} size={11} strokeWidth={2.4} />}
            />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 11.5,
                color: colors.foregroundMuted,
              }}
            >
              {formatDate(doc.created_at)}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 28,
              color: colors.foreground,
              letterSpacing: -0.6,
              lineHeight: 34,
            }}
          >
            {doc.title}
          </Text>
        </View>

        {/* Meta strip */}
        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            backgroundColor: colors.background,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flex: 1,
              padding: 14,
              borderRightWidth: 1,
              borderRightColor: colors.borderGhost,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Layers color={colors.foregroundMuted} size={12} strokeWidth={2.2} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  color: colors.foregroundMuted,
                }}
              >
                TOPICS
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 20,
                color: colors.foreground,
                marginTop: 4,
                letterSpacing: -0.4,
              }}
            >
              {doc.topic_count}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              padding: 14,
              borderRightWidth: 1,
              borderRightColor: colors.borderGhost,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <FileText color={colors.foregroundMuted} size={12} strokeWidth={2.2} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  color: colors.foregroundMuted,
                }}
              >
                WORDS
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 20,
                color: colors.foreground,
                marginTop: 4,
                letterSpacing: -0.4,
              }}
            >
              {doc.word_count}
            </Text>
          </View>
          <View style={{ flex: 1, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Eye color={colors.foregroundMuted} size={12} strokeWidth={2.2} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  color: colors.foregroundMuted,
                }}
              >
                FIDELITY
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <View
                style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }}
              />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: colors.foreground,
                  letterSpacing: -0.2,
                }}
              >
                Verified
              </Text>
            </View>
          </View>
        </View>

        {/* Section heading */}
        <View
          style={{
            marginTop: 24,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: colors.foregroundMuted,
            }}
          >
            Sections
          </Text>
          <Text
            style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.foregroundSoft }}
          >
            Grouped by topic
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {doc.sections.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                padding: 24,
                alignItems: 'center',
              }}
            >
              <Text
                style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.foreground }}
              >
                No sections detected
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  color: colors.foregroundMuted,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                The image may have been too blurry or empty.
              </Text>
            </View>
          ) : (
            <OrganizedSectionList sections={doc.sections} animateEntrance={isFresh} />
          )}
        </View>

        {/* Danger zone */}
        <View style={{ marginTop: 28 }}>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 12,
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: pressed ? '#FCA5A5' : colors.borderGhost,
              backgroundColor: pressed ? '#FEF2F2' : colors.background,
            })}
          >
            <Trash2 color={colors.danger} size={14} strokeWidth={2.2} />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 13,
                color: colors.danger,
                letterSpacing: -0.1,
              }}
            >
              Delete document
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.borderGhost,
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: pressed ? colors.canvasMuted : colors.background,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          })}
        >
          {justCopied ? (
            <>
              <CheckCircle2 color={colors.success} size={15} strokeWidth={2.2} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13.5,
                  color: colors.success,
                  letterSpacing: -0.1,
                }}
              >
                Copied
              </Text>
            </>
          ) : (
            <>
              <Copy color={colors.foreground} size={15} strokeWidth={2.2} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13.5,
                  color: colors.foreground,
                  letterSpacing: -0.1,
                }}
              >
                Copy
              </Text>
            </>
          )}
        </Pressable>
        <Pressable
          onPress={() => router.push(`/export/${docId}`)}
          style={({ pressed }) => ({
            flex: 1.4,
            backgroundColor: pressed ? '#1E40AF' : colors.primary,
            borderRadius: radii.sm,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
          })}
        >
          <Download color="#FFFFFF" size={15} strokeWidth={2.4} />
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 13.5,
              color: '#FFFFFF',
              letterSpacing: -0.1,
            }}
          >
            Export
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
