import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { X, FileText, Image as ImageIcon, Eye } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import ReviewModeSwitcher from '@/components/review/ReviewModeSwitcher';
import {
  ReviewSourcePanel,
  ReviewSplitPanel,
  ReviewStructuredPanel,
  type ReviewDocument,
} from '@/components/review/ReviewModePanels';
import {
  REVIEW_MODES,
  reviewModeFromIndex,
  reviewModeIndex,
  type ReviewMode,
} from '@/components/review/reviewModeTypes';
import { colors } from '@/constants/theme';
import { goBackOr } from '@/utils/navigation';
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri';
import { useScrollViewsToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const assignScrollRef = useScrollViewsToTopOnFocus<ReviewMode>();
  const params = useLocalSearchParams<{ id: string }>();
  const docId = params.id;
  const { width: pageWidth } = useWindowDimensions();
  const pagerRef = useAnimatedRef<Animated.ScrollView>();
  const modeRef = useRef<ReviewMode>('split');
  const [mode, setMode] = useState<ReviewMode>('split');
  const scrollX = useSharedValue(0);

  const { data, isLoading } = useQuery<{ document: ReviewDocument & { id: number; source_image_url: string } }>({
    queryKey: ['document', docId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: Boolean(docId),
  });

  const doc = data?.document;
  const imageUri = useResolvedImageUri(doc?.source_image_url);

  const selectMode = useCallback(
    (nextMode: ReviewMode, animated = true) => {
      const index = reviewModeIndex(nextMode);
      modeRef.current = nextMode;
      setMode(nextMode);
      scrollTo(pagerRef, index * pageWidth, 0, animated);
      scrollX.value = index * pageWidth;
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [pageWidth, pagerRef, scrollX]
  );

  const syncModeFromOffset = useCallback(
    (offsetX: number) => {
      if (pageWidth <= 0) return;

      const index = Math.min(
        REVIEW_MODES.length - 1,
        Math.max(0, Math.round(offsetX / pageWidth))
      );
      const nextMode = reviewModeFromIndex(index);
      if (nextMode !== modeRef.current) {
        modeRef.current = nextMode;
        setMode(nextMode);
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync().catch(() => {});
        }
      }
    },
    [pageWidth]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onEndDrag: (event) => {
      runOnJS(syncModeFromOffset)(event.contentOffset.x);
    },
    onMomentumEnd: (event) => {
      runOnJS(syncModeFromOffset)(event.contentOffset.x);
    },
  });

  useEffect(() => {
    if (pageWidth <= 0) return;
    const index = reviewModeIndex(modeRef.current);
    scrollTo(pagerRef, index * pageWidth, 0, false);
    scrollX.value = index * pageWidth;
  }, [pageWidth, pagerRef, scrollX]);

  const renderModeIcon = useCallback((nextMode: ReviewMode, active: boolean) => {
    const color = active ? colors.foreground : colors.foregroundMuted;
    if (nextMode === 'split') {
      return <Eye color={color} size={13} strokeWidth={2.2} />;
    }
    if (nextMode === 'source') {
      return <ImageIcon color={color} size={13} strokeWidth={2.2} />;
    }
    return <FileText color={color} size={13} strokeWidth={2.2} />;
  }, []);

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvasMuted }}>
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
          onPress={() => goBackOr(router, `/document/${docId}`)}
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

      <ReviewModeSwitcher
        mode={mode}
        pageWidth={pageWidth}
        scrollX={scrollX}
        pagerRef={pagerRef}
        onModeChange={selectMode}
        renderIcon={renderModeIcon}
      />

      <Animated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        <ReviewSplitPanel
          doc={doc}
          imageUri={imageUri}
          pageWidth={pageWidth}
          bottomInset={insets.bottom}
          scrollRef={assignScrollRef('split')}
        />
        <ReviewSourcePanel
          doc={doc}
          imageUri={imageUri}
          pageWidth={pageWidth}
          bottomInset={insets.bottom}
          scrollRef={assignScrollRef('source')}
        />
        <ReviewStructuredPanel
          doc={doc}
          pageWidth={pageWidth}
          bottomInset={insets.bottom}
          scrollRef={assignScrollRef('structured')}
        />
      </Animated.ScrollView>
    </View>
  );
}
