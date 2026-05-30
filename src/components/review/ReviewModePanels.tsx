import { ScrollView, Text, View, type ScrollView as ScrollViewType } from 'react-native';
import { Image } from 'expo-image';
import { FileText, Image as ImageIcon } from 'lucide-react-native';

import { colors, radii } from '@/constants/theme';
import Pill from '@/components/Pill';
import { useCustomTopics } from '@/hooks/useCustomTopics';
import { getTopicMeta } from '@/utils/topicCatalog';

export type ReviewSection = {
  id: string;
  title: string;
  category: string;
  content: string;
  items: string[];
  source_excerpt: string;
};

export type ReviewDocument = {
  title: string;
  raw_transcription: string;
  sections: ReviewSection[];
};

type PanelProps = {
  doc: ReviewDocument;
  imageUri: string;
  pageWidth: number;
  bottomInset: number;
  scrollRef?: (node: ScrollViewType | null) => void;
};

export function ReviewSplitPanel({ doc, imageUri, pageWidth, bottomInset, scrollRef }: PanelProps) {
  const { catalog } = useCustomTopics();
  return (
    <ScrollView
      ref={scrollRef}
      style={{ width: pageWidth }}
      contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 14 }}>
        <View style={{ gap: 8 }}>
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
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              padding: 8,
            }}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: '100%',
                  aspectRatio: 3 / 4,
                  borderRadius: radii.sm,
                  backgroundColor: colors.canvasMuted,
                }}
                contentFit="contain"
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  aspectRatio: 3 / 4,
                  borderRadius: radii.sm,
                  backgroundColor: colors.canvasMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageIcon color={colors.foregroundSoft} size={20} strokeWidth={1.8} />
              </View>
            )}
          </View>
        </View>

        <View style={{ gap: 8 }}>
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
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderGhost,
              padding: 10,
              gap: 6,
            }}
          >
            {doc.sections.slice(0, 4).map((section) => {
              const meta = getTopicMeta(section.category, catalog);
              return (
                <View
                  key={section.id}
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
                      {section.title}
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
                    {section.content || (section.items && section.items[0]) || ''}
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
            {doc.sections.map((section, index) => {
              const meta = getTopicMeta(section.category, catalog);
              return (
                <View
                  key={section.id || index}
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
                      {String(index + 1).padStart(2, '0')}
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
                    {section.title}
                  </Text>
                  {section.source_excerpt ? (
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
                        "{section.source_excerpt}"
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function ReviewSourcePanel({ doc, imageUri, pageWidth, bottomInset, scrollRef }: PanelProps) {
  return (
    <ScrollView
      ref={scrollRef}
      style={{ width: pageWidth }}
      contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.borderGhost,
          padding: 10,
        }}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: pageWidth - 52,
              aspectRatio: 3 / 4,
              borderRadius: radii.sm,
              backgroundColor: colors.canvasMuted,
            }}
            contentFit="contain"
          />
        ) : null}
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
    </ScrollView>
  );
}

export function ReviewStructuredPanel({
  doc,
  pageWidth,
  bottomInset,
  scrollRef,
}: Omit<PanelProps, 'imageUri'>) {
  const { catalog } = useCustomTopics();

  return (
    <ScrollView
      ref={scrollRef}
      style={{ width: pageWidth }}
      contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 10 }}>
        {doc.sections.map((section, index) => {
          const meta = getTopicMeta(section.category, catalog);
          return (
            <View
              key={section.id || index}
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
                  {String(index + 1).padStart(2, '0')}
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
                {section.title}
              </Text>
              {section.content ? (
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13.5,
                    color: '#374151',
                    marginTop: 8,
                    lineHeight: 20,
                  }}
                >
                  {section.content}
                </Text>
              ) : null}
              {section.items && section.items.length > 0 ? (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {section.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={{ flexDirection: 'row' }}>
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
    </ScrollView>
  );
}
