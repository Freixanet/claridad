import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { X, FileText, FileDown, Share2, Check, Hash } from 'lucide-react-native';
import { colors, radii, categoryMeta } from '@/constants/theme';
import Pill from '@/components/Pill';

type Section = {
  id: string;
  title: string;
  category: string;
  content: string;
  items: string[];
};

type DocumentDetail = {
  id: number;
  title: string;
  sections: Section[];
  topic_count: number;
  word_count: number;
};

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const docId = params.id;
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const markdown = useMemo(() => {
    if (!doc) return '';
    const lines: string[] = [`# ${doc.title}`, ''];
    doc.sections.forEach((s) => {
      const meta = categoryMeta[s.category] ?? categoryMeta.other;
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
  }, [doc]);

  const plainText = useMemo(() => {
    if (!doc) return '';
    const lines: string[] = [doc.title, '═'.repeat(Math.min(doc.title.length, 40)), ''];
    doc.sections.forEach((s, idx) => {
      lines.push(`${idx + 1}. ${s.title}`);
      lines.push('');
      if (s.content) {
        lines.push(s.content);
        lines.push('');
      }
      if (s.items && s.items.length > 0) {
        s.items.forEach((i) => lines.push(`  - ${i}`));
        lines.push('');
      }
    });
    return lines.join('\n');
  }, [doc]);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
    if (Platform.OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const handleCopyMd = useCallback(async () => {
    await Clipboard.setStringAsync(markdown);
    showFeedback('Markdown copied');
  }, [markdown, showFeedback]);

  const handleCopyText = useCallback(async () => {
    await Clipboard.setStringAsync(plainText);
    showFeedback('Plain text copied');
  }, [plainText, showFeedback]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: plainText, title: doc?.title });
    } catch (e) {
      console.error(e);
    }
  }, [plainText, doc?.title]);

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

  const options = [
    {
      key: 'markdown',
      icon: <Hash color={colors.foreground} size={16} strokeWidth={2.2} />,
      title: 'Copy as Markdown',
      detail: 'Headings, lists and tags ready for Notion, Obsidian or GitHub.',
      action: handleCopyMd,
      cta: 'Copy .md',
    },
    {
      key: 'text',
      icon: <FileText color={colors.foreground} size={16} strokeWidth={2.2} />,
      title: 'Copy as plain text',
      detail: 'Clean text suitable for messages, email or any app.',
      action: handleCopyText,
      cta: 'Copy text',
    },
    {
      key: 'share',
      icon: <Share2 color={colors.foreground} size={16} strokeWidth={2.2} />,
      title: 'Share via system',
      detail: 'Send to any app installed on your device.',
      action: handleShare,
      cta: 'Open share sheet',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvasMuted }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderGhost,
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
          Export
        </Text>
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Doc summary */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            padding: 16,
          }}
        >
          <Pill label="Document" />
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 19,
              color: colors.foreground,
              marginTop: 10,
              letterSpacing: -0.3,
              lineHeight: 24,
            }}
          >
            {doc.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            <Pill label={`${doc.topic_count} topics`} />
            <Pill label={`${doc.word_count} words`} />
          </View>
        </View>

        {/* Options */}
        <Text
          style={{
            marginTop: 22,
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: colors.foregroundMuted,
            paddingHorizontal: 4,
          }}
        >
          Choose a format
        </Text>

        <View style={{ marginTop: 10, gap: 10 }}>
          {options.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={opt.action}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.canvasMuted : colors.background,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.canvasMuted,
                  borderWidth: 1,
                  borderColor: colors.borderGhost,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {opt.icon}
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
                  {opt.title}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12.5,
                    color: colors.foregroundMuted,
                    marginTop: 2,
                    lineHeight: 17,
                  }}
                >
                  {opt.detail}
                </Text>
              </View>
              <Pill label={opt.cta} variant="soft" />
            </Pressable>
          ))}
        </View>

        {/* PDF placeholder */}
        <View
          style={{
            marginTop: 14,
            backgroundColor: colors.canvasMuted,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.borderGhost,
            borderStyle: 'dashed',
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileDown color={colors.foregroundMuted} size={16} strokeWidth={2.2} />
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
              PDF export
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12.5,
                color: colors.foregroundMuted,
                marginTop: 2,
              }}
            >
              Available on Claridad Pro
            </Text>
          </View>
          <Pill label="Pro" variant="soft" />
        </View>

        {/* Preview */}
        <Text
          style={{
            marginTop: 24,
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: colors.foregroundMuted,
            paddingHorizontal: 4,
          }}
        >
          Markdown preview
        </Text>
        <View
          style={{
            marginTop: 10,
            backgroundColor: colors.foreground,
            borderRadius: radii.md,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11.5,
              color: '#D1D5DB',
              lineHeight: 17,
            }}
          >
            {markdown.slice(0, 600)}
            {markdown.length > 600 ? '…' : ''}
          </Text>
        </View>
      </ScrollView>

      {/* Feedback toast */}
      {feedback ? (
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + 20,
            left: 20,
            right: 20,
            backgroundColor: colors.foreground,
            borderRadius: radii.sm,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Check color="#FFFFFF" size={15} strokeWidth={2.4} />
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: '#FFFFFF',
              letterSpacing: -0.1,
            }}
          >
            {feedback}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
