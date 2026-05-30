import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Reanimated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Animated,
  Alert,
  type View as RNView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  Pin,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurTargetView } from 'expo-blur';
import { Image } from 'expo-image';
import { colors, radii } from '@/constants/theme';
import Pill from '@/components/Pill';
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri';
import ClaridadLogo from '@/components/ClaridadLogo';
import CaptureFab from '@/components/CaptureFab';
import LibraryDocActionSheet from '@/components/LibraryDocActionSheet';
import LibraryAddCategorySheet from '@/components/LibraryAddCategorySheet';
import LibraryTabSettingsSheet from '@/components/LibraryTabSettingsSheet';
import ReorderableTabs from '@/components/ReorderableTabs';
import LibraryDocMotionList from '@/components/LibraryDocMotionList';
import { useLibraryCustomCategories } from '@/hooks/useLibraryCustomCategories';
import { usePlanMode } from '@/hooks/usePlanMode';
import { getTabOrder, mergeTabOrder, saveTabOrder } from '@/storage/tabOrder';
import { useScrollViewsToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { deleteDocument, updateDocument } from '@/services/documentStore';
import { getDocuments } from '@/storage/documents';
import type { StoredDocument } from '@/storage/documents';
import {
  customFilterKey,
  type CustomLibraryCategory,
} from '@/storage/libraryCategories';
import { libraryDocCardClassName, useWebLongPress } from '@/hooks/useWebLongPress';
import { clearWebTextSelection, webNoSelectStyle } from '@/utils/webNoSelect';

type DocumentRow = Pick<
  StoredDocument,
  | 'id'
  | 'title'
  | 'source_image_url'
  | 'topic_count'
  | 'word_count'
  | 'status'
  | 'pinned'
  | 'created_at'
> & {
  section_categories: string[];
};

const BASE_FILTERS = ['All', 'Recent', 'Pinned'] as const;
type BaseFilterKey = (typeof BASE_FILTERS)[number];
type FilterKey = BaseFilterKey | `custom:${string}`;

function toLibraryDocument(doc: StoredDocument): DocumentRow {
  return {
    id: doc.id,
    title: doc.title,
    source_image_url: doc.source_image_url,
    topic_count: doc.topic_count,
    word_count: doc.word_count,
    status: doc.status,
    pinned: doc.pinned,
    created_at: doc.created_at,
    section_categories: [...new Set(doc.sections.map((section) => section.category))],
  };
}

function sortLibraryDocuments(docs: DocumentRow[]): DocumentRow[] {
  return [...docs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function filterLibraryDocuments(all: StoredDocument[], search: string): DocumentRow[] {
  let result = all.filter((doc) => !doc.archived);

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (doc) =>
        doc.title.toLowerCase().includes(q) ||
        doc.raw_transcription.toLowerCase().includes(q) ||
        doc.sections.some(
          (section) =>
            section.title.toLowerCase().includes(q) ||
            section.content.toLowerCase().includes(q) ||
            section.items.some((item) => item.toLowerCase().includes(q))
        )
    );
  }

  return sortLibraryDocuments(result.map(toLibraryDocument));
}

function getFilterLabel(key: FilterKey, customCategories: CustomLibraryCategory[]): string {
  if (key === 'All' || key === 'Recent' || key === 'Pinned') return key;
  const id = key.replace('custom:', '');
  return customCategories.find((category) => category.id === id)?.label ?? 'Category';
}

function buildFilterKeys(customCategories: CustomLibraryCategory[]): FilterKey[] {
  return [...BASE_FILTERS, ...customCategories.map((category) => customFilterKey(category.id))];
}

function filterKeyFromTabLabel(
  label: string,
  categories: CustomLibraryCategory[]
): FilterKey | null {
  if (label === 'All' || label === 'Recent' || label === 'Pinned') return label;
  const category = categories.find((item) => item.label === label);
  return category ? customFilterKey(category.id) : null;
}

function partitionDocuments(
  all: DocumentRow[],
  customCategories: CustomLibraryCategory[]
): Record<FilterKey, DocumentRow[]> {
  const recent = [...all].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const partitions: Record<FilterKey, DocumentRow[]> = {
    All: all,
    Recent: recent,
    Pinned: all.filter((d) => d.pinned),
  };

  for (const category of customCategories) {
    partitions[customFilterKey(category.id)] = all.filter((doc) =>
      doc.section_categories.some((sectionCategory) =>
        category.categoryKeys.includes(sectionCategory)
      )
    );
  }

  return partitions;
}

function LibraryFilterContent({
  filterKey,
  filterLabel,
  documents,
  isLoading,
  search,
  onCapture,
  onOpenDoc,
  onDocLongPress,
}: {
  filterKey: FilterKey;
  filterLabel: string;
  documents: DocumentRow[];
  isLoading: boolean;
  search: string;
  onCapture: () => void;
  onOpenDoc: (id: number) => void;
  onDocLongPress: (doc: DocumentRow) => void;
}) {
  if (isLoading) {
    return (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <ActivityIndicator color={colors.foregroundMuted} />
      </View>
    );
  }

  if (documents.length === 0 && !search) {
    if (filterKey === 'All') {
      return (
        <>
          <View style={{ marginTop: 18 }}>
            <HeroIntro onCapture={onCapture} />
          </View>
          <EmptyState onCapture={onCapture} />
        </>
      );
    }

    const emptyCopy =
      filterKey === 'Pinned'
        ? { title: 'No pinned pages yet', hint: 'Pin a document to keep it here' }
        : filterKey.startsWith('custom:')
          ? {
              title: `No pages in “${filterLabel}”`,
              hint: 'Capture notes with matching section categories',
            }
          : { title: 'No recent pages', hint: 'New captures will show up here' };

    return (
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
          {emptyCopy.title}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: colors.foregroundMuted,
            marginTop: 4,
          }}
        >
          {emptyCopy.hint}
        </Text>
      </View>
    );
  }

  if (documents.length === 0) {
    return (
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
    );
  }

  return (
    <LibraryDocMotionList
      items={documents}
      keyExtractor={(doc) => doc.id}
      renderItem={(doc) => (
        <DocCard
          doc={doc}
          onPress={() => onOpenDoc(doc.id)}
          onLongPress={() => onDocLongPress(doc)}
        />
      )}
    />
  );
}

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

function DocCardThumbnail({ sourceImageUrl }: { sourceImageUrl: string }) {
  const imageUri = useResolvedImageUri(sourceImageUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUri]);

  const showImage = imageUri.length > 0 && !imageError;

  return (
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
      {showImage ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%', ...webNoSelectStyle }}
          contentFit="cover"
          transition={120}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.canvasMuted,
          }}
        >
          <FileText color={colors.foregroundSoft} size={22} strokeWidth={1.6} opacity={0.5} />
        </View>
      )}
    </View>
  );
}

function DocCard({
  doc,
  onPress,
  onLongPress,
}: {
  doc: DocumentRow;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const dateLabel = formatRelative(doc.created_at);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const menuOpenRef = useRef(false);

  const animatePressIn = useCallback(() => {
    menuOpenRef.current = false;
    Animated.timing(scaleAnim, {
      toValue: 0.985,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const animatePressOut = useCallback(() => {
    if (menuOpenRef.current) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 380,
    }).start();
  }, [scaleAnim]);

  const handleLongPress = useCallback(() => {
    menuOpenRef.current = true;
    clearWebTextSelection();
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 16,
      stiffness: 400,
    }).start();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onLongPress();
  }, [onLongPress, scaleAnim]);

  const webLongPressHandlers = useWebLongPress(handleLongPress, { delay: 300 });

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, webNoSelectStyle]}
      {...(Platform.OS === 'web' ? { className: libraryDocCardClassName } : {})}
    >
      <Pressable
        onPress={onPress}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        onLongPress={Platform.OS === 'web' ? undefined : handleLongPress}
        delayLongPress={300}
        {...webLongPressHandlers}
        {...(Platform.OS === 'web'
          ? {
              className: libraryDocCardClassName,
              onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
            }
          : {})}
        style={({ pressed }) => ({
          backgroundColor: colors.background,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: pressed ? colors.borderStrong : colors.borderGhost,
          padding: 14,
          flexDirection: 'row',
          gap: 12,
          opacity: pressed ? 0.92 : 1,
          ...webNoSelectStyle,
        })}
      >
      <DocCardThumbnail sourceImageUrl={doc.source_image_url} />

      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {doc.pinned ? (
              <Pin color={colors.warning} size={11} strokeWidth={2.4} fill={colors.warning} />
            ) : null}
            <Text
              numberOfLines={1}
              selectable={false}
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
              textSelectable={false}
            />
            <Pill
              label={`${doc.word_count}w`}
              icon={<FileText color={colors.foreground} size={10} strokeWidth={2.2} />}
              textSelectable={false}
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
            selectable={false}
            style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.foregroundMuted }}
          >
            {dateLabel}
          </Text>
          <ArrowRight color={colors.foregroundSoft} size={14} strokeWidth={2} />
        </View>
      </View>
    </Pressable>
    </Animated.View>
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
  const { width: screenWidth } = useWindowDimensions();
  const { isPro } = usePlanMode();
  const { categories: customCategories, createCategory, updateCategory, removeCategory } =
    useLibraryCustomCategories();
  const [savedTabOrder, setSavedTabOrder] = useState<string[] | null>(null);
  const orderedCustomCategories = useMemo(() => {
    if (savedTabOrder === null) return customCategories;
    return mergeTabOrder(customCategories, savedTabOrder);
  }, [customCategories, savedTabOrder]);
  const filterKeys = useMemo(
    () => buildFilterKeys(orderedCustomCategories),
    [orderedCustomCategories]
  );
  const customTabLabels = useMemo(
    () => orderedCustomCategories.map((category) => category.label),
    [orderedCustomCategories]
  );
  const [filter, setFilter] = useState<FilterKey>('All');
  const [search, setSearch] = useState('');
  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState<CustomLibraryCategory | null>(null);
  const pagerRef = useRef<Reanimated.ScrollView>(null);
  const filterIndexRef = useRef(0);
  const filterRef = useRef<FilterKey>('All');
  const scrollX = useSharedValue(0);
  const assignVerticalScrollRef = useScrollViewsToTopOnFocus<FilterKey>();
  const queryClient = useQueryClient();
  const [actionDoc, setActionDoc] = useState<DocumentRow | null>(null);

  useEffect(() => {
    void getTabOrder().then(setSavedTabOrder);
  }, []);

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const updated = updateDocument(id, { archived: true, pinned: false });
      if (!updated) throw new Error('Failed to archive');
      return updated;
    },
    onSuccess: () => {
      setActionDoc(null);
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: number; pinned: boolean }) => {
      const updated = updateDocument(id, { pinned });
      if (!updated) throw new Error('Failed to pin');
      return updated;
    },
    onSuccess: () => {
      setActionDoc(null);
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const ok = deleteDocument(id);
      if (!ok) throw new Error('Failed to delete');
      return { ok: true };
    },
    onSuccess: () => {
      setActionDoc(null);
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleDocLongPress = useCallback((doc: DocumentRow) => {
    setActionDoc(doc);
  }, []);

  const handlePin = useCallback(() => {
    if (!actionDoc || pinMutation.isPending) return;
    pinMutation.mutate({ id: actionDoc.id, pinned: !actionDoc.pinned });
  }, [actionDoc, pinMutation]);

  const handleArchive = useCallback(() => {
    if (!actionDoc || archiveMutation.isPending) return;
    archiveMutation.mutate(actionDoc.id);
  }, [actionDoc, archiveMutation]);

  const handleDeleteConfirm = useCallback(() => {
    if (!actionDoc || deleteMutation.isPending) return;
    deleteMutation.mutate(actionDoc.id);
  }, [actionDoc, deleteMutation]);

  const { data, isLoading, refetch, isRefetching } = useQuery<{ documents: DocumentRow[] }>({
    queryKey: ['documents', search],
    queryFn: async () => {
      const stored = await getDocuments();
      return { documents: filterLibraryDocuments(stored, search) };
    },
    staleTime: 0,
  });

  const documentsByFilter = useMemo(
    () => partitionDocuments(data?.documents ?? [], customCategories),
    [customCategories, data]
  );

  const documents = documentsByFilter[filter] ?? [];

  const totals = useMemo(() => {
    const totalTopics = documents.reduce((acc, d) => acc + d.topic_count, 0);
    const totalWords = documents.reduce((acc, d) => acc + d.word_count, 0);
    return {
      pages: documents.length,
      topics: totalTopics,
      words: totalWords,
    };
  }, [documents]);

  const selectFilter = useCallback(
    (next: FilterKey, animated = true) => {
      const index = filterKeys.indexOf(next);
      if (index === -1) return;
      filterIndexRef.current = index;
      filterRef.current = next;
      setFilter(next);
      pagerRef.current?.scrollTo({ x: index * screenWidth, animated });
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [filterKeys, screenWidth]
  );

  const handleAddCategoryPress = useCallback(() => {
    if (!isPro) {
      Alert.alert(
        'Claridad Pro',
        'Custom category filters are available on Claridad Pro. Enable Preview Pro in Settings.'
      );
      return;
    }
    setAddCategoryVisible(true);
  }, [isPro]);

  const handleCreateCategory = useCallback(
    async (category: CustomLibraryCategory) => {
      await createCategory(category);
      const nextKey = customFilterKey(category.id);
      const index = filterKeys.length;
      filterIndexRef.current = index;
      filterRef.current = nextKey;
      setFilter(nextKey);
      pagerRef.current?.scrollTo({ x: index * screenWidth, animated: true });
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [createCategory, filterKeys.length, screenWidth]
  );

  const handleTabSettings = useCallback(
    (tabLabel: string) => {
      if (!isPro) {
        Alert.alert(
          'Claridad Pro',
          'Custom tab settings are available on Claridad Pro. Enable Preview Pro in Settings.'
        );
        return;
      }
      const category = customCategories.find((item) => item.label === tabLabel);
      if (category) setSettingsCategory(category);
    },
    [customCategories, isPro]
  );

  const handleUpdateCategory = useCallback(
    async (category: CustomLibraryCategory) => {
      await updateCategory(category.id, {
        label: category.label,
        categoryKeys: category.categoryKeys,
      });
    },
    [updateCategory]
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      const deletedKey = customFilterKey(id);
      const nextOrder = (savedTabOrder ?? []).filter((entry) => entry !== id);
      setSavedTabOrder(nextOrder);
      await saveTabOrder(nextOrder);
      await removeCategory(id);
      if (filterRef.current === deletedKey) {
        selectFilter('All', false);
      }
    },
    [removeCategory, savedTabOrder, selectFilter]
  );

  const handleReorderCustomTabs = useCallback(
    async (nextLabels: string[]) => {
      const labelToId = new Map(customCategories.map((category) => [category.label, category.id]));
      const nextIds = nextLabels
        .map((label) => labelToId.get(label))
        .filter((id): id is string => typeof id === 'string');
      setSavedTabOrder(nextIds);
      await saveTabOrder(nextIds);

      const nextFilterKeys = buildFilterKeys(mergeTabOrder(customCategories, nextIds));
      const current = filterRef.current;
      const newIndex = nextFilterKeys.indexOf(current);
      if (newIndex >= 0) {
        filterIndexRef.current = newIndex;
        pagerRef.current?.scrollTo({ x: newIndex * screenWidth, animated: false });
        scrollX.value = newIndex * screenWidth;
      }
    },
    [customCategories, screenWidth, scrollX]
  );

  const handleTabSelect = useCallback(
    (tab: string) => {
      const next = filterKeyFromTabLabel(tab, customCategories);
      if (next) selectFilter(next);
    },
    [customCategories, selectFilter]
  );

  useEffect(() => {
    if (!filterKeys.includes(filter)) {
      selectFilter('All', false);
      return;
    }
    const index = filterKeys.indexOf(filterRef.current);
    if (index >= 0 && index !== filterIndexRef.current) {
      filterIndexRef.current = index;
      pagerRef.current?.scrollTo({ x: index * screenWidth, animated: false });
      scrollX.value = index * screenWidth;
    }
  }, [filter, filterKeys, screenWidth, scrollX, selectFilter]);

  const syncActiveFilterFromOffset = useCallback(
    (offsetX: number) => {
      const index = Math.min(
        filterKeys.length - 1,
        Math.max(0, Math.round(offsetX / screenWidth))
      );
      const next = filterKeys[index];
      if (!next || next === filterRef.current) return;
      filterIndexRef.current = index;
      filterRef.current = next;
      setFilter(next);
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [filterKeys, screenWidth]
  );

  const handlePagerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onEndDrag: (event) => {
      runOnJS(syncActiveFilterFromOffset)(event.contentOffset.x);
    },
    onMomentumEnd: (event) => {
      runOnJS(syncActiveFilterFromOffset)(event.contentOffset.x);
    },
  });

  useEffect(() => {
    pagerRef.current?.scrollTo({ x: filterIndexRef.current * screenWidth, animated: false });
  }, [screenWidth]);

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

  const blurTargetRef = useRef<RNView>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvasMuted }}>
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
        }}
      >
        {/* Brand row */}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ClaridadLogo size={28} />
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

        <View
          style={{
            marginTop: 18,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderGhost,
          }}
        >
          <ReorderableTabs
            customTabs={customTabLabels}
            active={getFilterLabel(filter, customCategories)}
            scrollX={scrollX}
            screenWidth={screenWidth}
            isPro={isPro}
            onSelect={handleTabSelect}
            onReorder={handleReorderCustomTabs}
            onTabSettings={handleTabSettings}
            onAdd={handleAddCategoryPress}
          />
        </View>
      </View>

      <Reanimated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handlePagerScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled
        style={{ flex: 1 }}
      >
        {filterKeys.map((filterKey) => (
          <View key={filterKey} style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={assignVerticalScrollRef(filterKey)}
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 120,
              }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor={colors.foregroundMuted}
                />
              }
            >
              <LibraryFilterContent
                filterKey={filterKey}
                filterLabel={getFilterLabel(filterKey, customCategories)}
                documents={documentsByFilter[filterKey] ?? []}
                isLoading={isLoading}
                search={search}
                onCapture={openCapture}
                onOpenDoc={openDoc}
                onDocLongPress={handleDocLongPress}
              />
            </ScrollView>
          </View>
        ))}
      </Reanimated.ScrollView>
      </BlurTargetView>

      <LibraryDocActionSheet
        visible={actionDoc !== null}
        docTitle={actionDoc?.title ?? ''}
        pinned={actionDoc?.pinned ?? false}
        onPin={handlePin}
        onArchive={handleArchive}
        onDelete={handleDeleteConfirm}
        onClose={() => setActionDoc(null)}
      />

      <LibraryAddCategorySheet
        visible={addCategoryVisible}
        isPro={isPro}
        onClose={() => setAddCategoryVisible(false)}
        onSave={handleCreateCategory}
      />

      <LibraryTabSettingsSheet
        visible={settingsCategory !== null}
        category={settingsCategory}
        isPro={isPro}
        onClose={() => setSettingsCategory(null)}
        onSave={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />

      <CaptureFab onPress={openCapture} blurTargetRef={blurTargetRef} />
    </View>
  );
}
