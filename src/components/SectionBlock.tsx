import { View, Text } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

import Pill from '@/components/Pill';
import { colors, radii } from '@/constants/theme';
import { useCustomTopics } from '@/hooks/useCustomTopics';
import { getTopicMeta } from '@/utils/topicCatalog';
import { useClaridadMotion } from '@/motion/useClaridadMotion';

export type SectionData = {
  id: string;
  title: string;
  category: string;
  content: string;
  items: string[];
  source_excerpt: string;
};

type Props = {
  section: SectionData;
  index: number;
  entering?: AnimatedProps<typeof Animated.View>['entering'];
};

export default function SectionBlock({ section, index, entering }: Props) {
  const { itemLayoutTransition } = useClaridadMotion();
  const { catalog } = useCustomTopics();
  const meta = getTopicMeta(section.category, catalog);
  const hasItems = Array.isArray(section.items) && section.items.length > 0;
  const hasContent = section.content && section.content.trim().length > 0;

  return (
    <Animated.View layout={itemLayoutTransition} entering={entering}>
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.borderGhost,
          padding: 18,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pill label={meta.label} dotColor={meta.dot} />
            <Text
              style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.foregroundSoft }}
            >
              {String(index + 1).padStart(2, '0')}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            color: colors.foreground,
            letterSpacing: -0.3,
            marginTop: 12,
            lineHeight: 24,
          }}
        >
          {section.title}
        </Text>

        {hasContent ? (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: '#374151',
              marginTop: 10,
              lineHeight: 22,
            }}
          >
            {section.content}
          </Text>
        ) : null}

        {hasItems ? (
          <View style={{ marginTop: hasContent ? 12 : 10, gap: 6 }}>
            {section.items.map((item, idx) => (
              <View key={`${section.id}-${idx}`} style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: colors.foregroundSoft,
                    width: 16,
                  }}
                >
                  -
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: '#374151',
                    lineHeight: 21,
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
