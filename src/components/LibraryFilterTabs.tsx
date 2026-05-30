import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import type { CustomLibraryCategory } from '@/storage/libraryCategories';
import { colors, radii } from '@/constants/theme';
import { CLARIDAD_SPRING } from '@/motion/config';
import { useClaridadMotion } from '@/motion/useClaridadMotion';

const TAB_GAP = 22;
const LONG_PRESS_MS = 280;
const LIFT_OFFSET_Y = 48;

type FilterKey = string;
type TabLayout = { x: number; y: number; width: number; height: number };

type DragSession<T extends FilterKey> = {
  key: T;
  label: string;
  active: boolean;
  layout: TabLayout;
};

type Props<T extends FilterKey = FilterKey> = {
  filterKeys: T[];
  activeFilter: T;
  customCategories: CustomLibraryCategory[];
  isPro: boolean;
  screenWidth: number;
  scrollX: Animated.Value;
  onSelectFilter: (key: T) => void;
  onReorder: (keys: T[]) => void;
  onAddPress: () => void;
};

function getFilterLabel(key: FilterKey, customCategories: CustomLibraryCategory[]): string {
  if (key === 'All' || key === 'Recent' || key === 'Pinned') return key;
  const id = key.replace('custom:', '');
  return customCategories.find((category) => category.id === id)?.label ?? 'Category';
}

function buildFinalOrder<T extends FilterKey>(
  keys: T[],
  draggedKey: T,
  targetIndex: number
): T[] {
  const without = keys.filter((key) => key !== draggedKey);
  const next = [...without];
  next.splice(targetIndex, 0, draggedKey);
  return next;
}

function slotLeftForIndex<T extends FilterKey>(
  order: T[],
  widths: Partial<Record<T, number>>,
  index: number
): number {
  let left = 0;
  for (let i = 0; i < index; i += 1) {
    left += (widths[order[i]] ?? 0) + TAB_GAP;
  }
  return left;
}

function computeInsertIndex<T extends FilterKey>(
  order: T[],
  widths: Partial<Record<T, number>>,
  pointerCenterX: number
): number {
  let left = 0;
  for (let index = 0; index < order.length; index += 1) {
    const key = order[index];
    const width = widths[key] ?? 0;
    const midpoint = left + width / 2;
    if (pointerCenterX < midpoint) return index;
    left += width + TAB_GAP;
  }
  return order.length;
}

type FilterTabItemProps<T extends FilterKey> = {
  filterKey: T;
  label: string;
  active: boolean;
  dimmed: boolean;
  dragEnabled: boolean;
  layoutTransition: ReturnType<typeof useClaridadMotion>['itemLayoutTransition'];
  onPress: () => void;
  onMeasureNode: (key: T, node: View | null) => void;
  onDragBegin: (key: T) => void;
  onDragMove: (translationX: number) => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
};

function FilterTabItem<T extends FilterKey>({
  filterKey,
  label,
  active,
  dimmed,
  dragEnabled,
  layoutTransition,
  onPress,
  onMeasureNode,
  onDragBegin,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: FilterTabItemProps<T>) {
  const tabRef = useRef<View>(null);

  const panGesture = Gesture.Pan()
    .enabled(dragEnabled)
    .activateAfterLongPress(LONG_PRESS_MS)
    .onBegin(() => {
      runOnJS(onDragBegin)(filterKey);
    })
    .onUpdate((event) => {
      runOnJS(onDragMove)(event.translationX);
    })
    .onEnd(() => {
      runOnJS(onDragEnd)();
    })
    .onFinalize((_event, success) => {
      if (!success) {
        runOnJS(onDragCancel)();
      }
    });

  return (
    <Reanimated.View layout={layoutTransition} collapsable={false}>
      <GestureDetector gesture={panGesture}>
        <View
          ref={tabRef}
          collapsable={false}
          onLayout={() => onMeasureNode(filterKey, tabRef.current)}
        >
          <Pressable
            onPress={onPress}
            style={{
              marginRight: TAB_GAP,
              paddingBottom: 10,
              opacity: dimmed ? 0.42 : 1,
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
              {label}
            </Text>
          </Pressable>
        </View>
      </GestureDetector>
    </Reanimated.View>
  );
}

function InsertionGap({
  width,
  layoutTransition,
}: {
  width: number;
  layoutTransition: ReturnType<typeof useClaridadMotion>['itemLayoutTransition'];
}) {
  return (
    <Reanimated.View
      layout={layoutTransition}
      style={{
        width,
        marginRight: TAB_GAP,
        paddingBottom: 10,
      }}
    />
  );
}

function DragGhostPill({
  label,
  active,
  width,
  height,
  ghostLeft,
  ghostTop,
  ghostScale,
  ghostOpacity,
}: {
  label: string;
  active: boolean;
  width: number;
  height: number;
  ghostLeft: SharedValue<number>;
  ghostTop: SharedValue<number>;
  ghostScale: SharedValue<number>;
  ghostOpacity: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: ghostOpacity.value,
    left: ghostLeft.value,
    top: ghostTop.value,
    transform: [{ scale: ghostScale.value }],
  }));

  return (
    <Reanimated.View
      pointerEvents="none"
      style={[
        styles.ghostPill,
        {
          width,
          minHeight: height,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium',
          fontSize: 14,
          color: colors.foreground,
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
    </Reanimated.View>
  );
}

export default function LibraryFilterTabs<T extends FilterKey>({
  filterKeys,
  activeFilter,
  customCategories,
  isPro,
  screenWidth,
  scrollX,
  onSelectFilter,
  onReorder,
  onAddPress,
}: Props<T>) {
  const { itemLayoutTransition } = useClaridadMotion();
  const [tabWidths, setTabWidths] = useState<Partial<Record<T, number>>>({});
  const [dragSession, setDragSession] = useState<DragSession<T> | null>(null);
  const [insertIndex, setInsertIndex] = useState(0);

  const tabLayoutsRef = useRef<Partial<Record<T, TabLayout>>>({});
  const tabWidthsRef = useRef<Partial<Record<T, number>>>({});
  const tabNodesRef = useRef<Map<T, View>>(new Map());
  const insertIndexRef = useRef(0);
  const dragSessionRef = useRef<DragSession<T> | null>(null);
  const rowRef = useRef<View>(null);
  const pendingTranslationRef = useRef(0);

  const ghostLeft = useSharedValue(0);
  const ghostTop = useSharedValue(0);
  const ghostScale = useSharedValue(1);
  const ghostOpacity = useSharedValue(0);
  const dragTranslationX = useSharedValue(0);

  const measureTabInRow = useCallback((key: T, node: View | null) => {
    const row = rowRef.current;
    if (!node || !row) return;

    node.measureLayout(
      row,
      (x, y, width, height) => {
        tabLayoutsRef.current[key] = { x, y, width, height };
        tabWidthsRef.current[key] = width;
        setTabWidths((previous) => {
          if (previous[key] === width) return previous;
          return { ...previous, [key]: width };
        });
      },
      () => {}
    );
  }, []);

  const remeasureAllTabs = useCallback(() => {
    tabNodesRef.current.forEach((node, key) => {
      measureTabInRow(key, node);
    });
  }, [measureTabInRow]);

  const registerTabNode = useCallback(
    (key: T, node: View | null) => {
      if (node) {
        tabNodesRef.current.set(key, node);
      } else {
        tabNodesRef.current.delete(key);
      }
      measureTabInRow(key, node);
    },
    [measureTabInRow]
  );

  useEffect(() => {
    remeasureAllTabs();
  }, [filterKeys, dragSession, insertIndex, remeasureAllTabs]);

  const resetDrag = useCallback(() => {
    dragSessionRef.current = null;
    dragTranslationX.value = 0;
    pendingTranslationRef.current = 0;
    setDragSession(null);
    ghostOpacity.value = 0;
    ghostScale.value = 1;
  }, [dragTranslationX, ghostOpacity, ghostScale]);

  const applyDragMove = useCallback(
    (translationX: number) => {
      const session = dragSessionRef.current;
      if (!session) return;

      dragTranslationX.value = translationX;
      ghostLeft.value = session.layout.x + translationX;
      ghostTop.value = Math.max(0, session.layout.y) - LIFT_OFFSET_Y;

      const pointerCenterX = session.layout.x + session.layout.width / 2 + translationX;
      const orderWithoutDragged = filterKeys.filter((key) => key !== session.key);
      const nextIndex = computeInsertIndex(orderWithoutDragged, tabWidthsRef.current, pointerCenterX);

      if (nextIndex !== insertIndexRef.current) {
        insertIndexRef.current = nextIndex;
        setInsertIndex(nextIndex);
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [dragTranslationX, filterKeys, ghostLeft, ghostTop]
  );

  const startDragSession = useCallback(
    (key: T, layout: TabLayout) => {
      const label = getFilterLabel(key, customCategories);
      const active = activeFilter === key;
      const session: DragSession<T> = { key, label, active, layout };
      const startIndex = filterKeys.indexOf(key);

      dragSessionRef.current = session;
      insertIndexRef.current = startIndex;
      setInsertIndex(startIndex);
      setDragSession(session);

      dragTranslationX.value = 0;
      ghostLeft.value = layout.x;
      ghostTop.value = Math.max(0, layout.y) - LIFT_OFFSET_Y;
      ghostScale.value = 0.94;
      ghostOpacity.value = withSpring(1, CLARIDAD_SPRING);
      ghostScale.value = withSpring(1.04, CLARIDAD_SPRING);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      applyDragMove(pendingTranslationRef.current);
    },
    [
      activeFilter,
      applyDragMove,
      customCategories,
      dragTranslationX,
      filterKeys,
      ghostLeft,
      ghostOpacity,
      ghostScale,
      ghostTop,
    ]
  );

  const handleDragBegin = useCallback(
    (key: T) => {
      if (!isPro) {
        Alert.alert(
          'Claridad Pro',
          'Custom filter order is available on Claridad Pro. Enable Preview Pro in Settings.'
        );
        return;
      }

      const node = tabNodesRef.current.get(key);
      const row = rowRef.current;
      if (!node || !row) return;

      pendingTranslationRef.current = 0;

      node.measureLayout(
        row,
        (x, y, width, height) => {
          if (width <= 0) return;
          const layout = { x, y, width, height };
          tabLayoutsRef.current[key] = layout;
          tabWidthsRef.current[key] = width;
          startDragSession(key, layout);
        },
        () => {
          const width = tabWidthsRef.current[key] ?? 72;
          const index = filterKeys.indexOf(key);
          const layout: TabLayout = {
            x: slotLeftForIndex(filterKeys, tabWidthsRef.current, index),
            y: 0,
            width,
            height: 34,
          };
          startDragSession(key, layout);
        }
      );
    },
    [filterKeys, isPro, startDragSession]
  );

  const handleDragMove = useCallback(
    (translationX: number) => {
      pendingTranslationRef.current = translationX;
      applyDragMove(translationX);
    },
    [applyDragMove]
  );

  const handleDragEnd = useCallback(() => {
    const session = dragSessionRef.current;
    if (!session) {
      resetDrag();
      return;
    }

    const orderWithoutDragged = filterKeys.filter((key) => key !== session.key);
    const targetIndex = insertIndexRef.current;
    const slotLeft = slotLeftForIndex(orderWithoutDragged, tabWidthsRef.current, targetIndex);

    ghostLeft.value = withSpring(slotLeft, CLARIDAD_SPRING);
    ghostTop.value = withSpring(session.layout.y, CLARIDAD_SPRING);
    ghostScale.value = withSpring(1, CLARIDAD_SPRING);

    const nextOrder = buildFinalOrder(filterKeys, session.key, targetIndex);
    if (nextOrder.join('|') !== filterKeys.join('|')) {
      onReorder(nextOrder);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    setTimeout(() => {
      ghostOpacity.value = withSpring(0, CLARIDAD_SPRING, (finished) => {
        if (finished) {
          runOnJS(resetDrag)();
        }
      });
    }, 240);
  }, [filterKeys, ghostLeft, ghostOpacity, ghostScale, ghostTop, onReorder, resetDrag]);

  const handleDragCancel = useCallback(() => {
    ghostScale.value = withSpring(1, CLARIDAD_SPRING);
    ghostOpacity.value = withSpring(0, CLARIDAD_SPRING, (finished) => {
      if (finished) {
        runOnJS(resetDrag)();
      }
    });
  }, [ghostOpacity, ghostScale, resetDrag]);

  const visibleKeys = dragSession
    ? filterKeys.filter((key) => key !== dragSession.key)
    : filterKeys;

  let runningX = 0;
  const tabPositions = filterKeys.map((key) => {
    const width = tabWidths[key] ?? 0;
    const position = { x: runningX, width };
    runningX += width + TAB_GAP;
    return position;
  });

  const tabsMeasured = filterKeys.length > 0 && filterKeys.every((key) => tabWidths[key]);

  const underlineTranslateX = scrollX.interpolate({
    inputRange: filterKeys.map((_, index) => index * screenWidth),
    outputRange: tabPositions.map((metric) => metric.x),
    extrapolate: 'clamp',
  });

  const underlineWidth = scrollX.interpolate({
    inputRange: filterKeys.map((_, index) => index * screenWidth),
    outputRange: tabPositions.map((metric) => metric.width),
    extrapolate: 'clamp',
  });

  const handleRowLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      remeasureAllTabs();
    },
    [remeasureAllTabs]
  );

  const tabNodes: ReactNode[] = [];

  visibleKeys.forEach((key, index) => {
    if (dragSession && insertIndex === index) {
      tabNodes.push(
        <InsertionGap
          key={`gap-${index}`}
          width={dragSession.layout.width}
          layoutTransition={itemLayoutTransition}
        />
      );
    }

    tabNodes.push(
      <FilterTabItem
        key={key}
        filterKey={key}
        label={getFilterLabel(key, customCategories)}
        active={activeFilter === key}
        dimmed={dragSession !== null}
        dragEnabled={isPro && dragSession === null}
        layoutTransition={itemLayoutTransition}
        onPress={() => onSelectFilter(key)}
        onMeasureNode={registerTabNode}
        onDragBegin={handleDragBegin}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      />
    );
  });

  if (dragSession && insertIndex === visibleKeys.length) {
    tabNodes.push(
      <InsertionGap
        key="gap-end"
        width={dragSession.layout.width}
        layoutTransition={itemLayoutTransition}
      />
    );
  }

  return (
    <View
      style={{
        marginTop: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderGhost,
        position: 'relative',
      }}
    >
      <ScrollView
        horizontal
        scrollEnabled={!dragSession}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <View
          ref={rowRef}
          onLayout={handleRowLayout}
          style={{ flexDirection: 'row', position: 'relative', alignItems: 'flex-end' }}
        >
          {tabNodes}

          {dragSession ? (
            <DragGhostPill
              label={dragSession.label}
              active={dragSession.active}
              width={dragSession.layout.width}
              height={dragSession.layout.height}
              ghostLeft={ghostLeft}
              ghostTop={ghostTop}
              ghostScale={ghostScale}
              ghostOpacity={ghostOpacity}
            />
          ) : null}

          <Pressable
            onPress={onAddPress}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingBottom: 10,
              opacity: pressed ? 0.7 : isPro ? 1 : dragSession ? 0.42 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: isPro ? colors.primary : colors.foregroundMuted,
                letterSpacing: -0.1,
              }}
            >
              Add
            </Text>
            <Plus color={isPro ? colors.primary : colors.foregroundMuted} size={14} strokeWidth={2.4} />
          </Pressable>
        </View>
      </ScrollView>

      {tabsMeasured && !dragSession ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            bottom: -1,
            height: 2,
            backgroundColor: colors.primary,
            width: underlineWidth,
            transform: [{ translateX: underlineTranslateX }],
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ghostPill: {
    position: 'absolute',
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: colors.borderGhost,
    paddingHorizontal: 2,
    paddingVertical: 10,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 100,
  },
});
