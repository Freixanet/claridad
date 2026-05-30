import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  LinearTransition,
  ReduceMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';

import { colors } from '@/constants/theme';

const TAB_GAP = 22;
const SPRING = { stiffness: 300, damping: 30 };
const layoutTransition = LinearTransition.springify()
  .damping(30)
  .stiffness(300)
  .reduceMotion(ReduceMotion.System);

const FIXED = ['All', 'Recent', 'Pinned'];

type TabLayout = { x: number; width: number };

type TabLabelProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  onLabelLayout?: (width: number) => void;
};

type DraggableTabProps = {
  label: string;
  active: boolean;
  onSelect: (tab: string) => void;
  onTabSettings: (label: string) => void;
  layouts: React.MutableRefObject<Record<string, TabLayout>>;
  order: React.MutableRefObject<string[]>;
  setOrder: (next: string[]) => void;
  onReorder: (next: string[]) => void;
  onTabLayout: (label: string, patch: Partial<TabLayout>) => void;
};

type Props = {
  customTabs: string[];
  active: string;
  scrollX: SharedValue<number>;
  screenWidth: number;
  isPro?: boolean;
  onSelect: (tab: string) => void;
  onReorder: (next: string[]) => void;
  onTabSettings: (label: string) => void;
  onAdd: () => void;
};

function mergeCustomTabOrder(incoming: string[], current: string[]): string[] {
  const kept = current.filter((tab) => incoming.includes(tab));
  const added = incoming.filter((tab) => !kept.includes(tab));
  return kept.length > 0 || added.length > 0 ? [...kept, ...added] : incoming;
}

function TabLabel({ label, active, onPress, onLabelLayout }: TabLabelProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      onLayout={(event: LayoutChangeEvent) => {
        onLabelLayout?.(event.nativeEvent.layout.width);
      }}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

function DraggableTab({
  label,
  active,
  onSelect,
  onTabSettings,
  layouts,
  order,
  setOrder,
  onReorder,
  onTabLayout,
}: DraggableTabProps) {
  const tx = useSharedValue(0);
  const lifted = useSharedValue(0);

  const openSettings = useCallback(() => {
    onTabSettings(label);
  }, [label, onTabSettings]);

  const reorderTo = useCallback(
    (from: number, to: number) => {
      const next = [...order.current];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      order.current = next;
      setOrder(next);
      Haptics.selectionAsync().catch(() => {});
    },
    [order, setOrder]
  );

  const settingsPress = Gesture.LongPress()
    .minDuration(280)
    .maxDistance(10)
    .onStart(() => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(openSettings)();
    });

  const reorderPan = Gesture.Pan()
    .activateAfterLongPress(500)
    .onStart(() => {
      lifted.value = withSpring(1, SPRING);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      const me = layouts.current[label];
      if (!me) return;
      const center = me.x + me.width / 2 + e.translationX;
      const cur = order.current.indexOf(label);
      for (let j = 0; j < order.current.length; j += 1) {
        if (j === cur) continue;
        const other = layouts.current[order.current[j]];
        if (!other) continue;
        if (center > other.x && center < other.x + other.width) {
          const delta = me.x - other.x;
          tx.value = e.translationX + delta;
          runOnJS(reorderTo)(cur, j);
          break;
        }
      }
    })
    .onEnd(() => {
      tx.value = withSpring(0, SPRING);
      lifted.value = withSpring(0, SPRING);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      runOnJS(onReorder)(order.current);
    });

  const tabGesture = Gesture.Exclusive(settingsPress, reorderPan);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { scale: 1 + lifted.value * 0.08 }],
    zIndex: lifted.value > 0 ? 10 : 0,
    shadowOpacity: lifted.value * 0.18,
    shadowRadius: lifted.value * 10,
    shadowOffset: { width: 0, height: lifted.value * 4 },
    shadowColor: '#1C1E2A',
  }));

  return (
    <Reanimated.View
      layout={layoutTransition}
      style={styles.tabItem}
      onLayout={(ev) => {
        onTabLayout(label, { x: ev.nativeEvent.layout.x });
      }}
    >
      <GestureDetector gesture={tabGesture}>
        <Reanimated.View style={dragStyle}>
          <TabLabel
            label={label}
            active={active}
            onPress={() => onSelect(label)}
            onLabelLayout={(width) => onTabLayout(label, { width })}
          />
        </Reanimated.View>
      </GestureDetector>
    </Reanimated.View>
  );
}

export default function ReorderableTabs({
  customTabs,
  active,
  scrollX,
  screenWidth,
  isPro = true,
  onSelect,
  onReorder,
  onTabSettings,
  onAdd,
}: Props) {
  const [order, setOrderState] = useState<string[]>(customTabs);
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const orderRef = useRef<string[]>(customTabs);
  const layouts = useRef<Record<string, TabLayout>>({});

  const setOrder = useCallback((next: string[]) => {
    orderRef.current = next;
    setOrderState(next);
  }, []);

  useEffect(() => {
    setOrderState((previous) => {
      const next = mergeCustomTabOrder(customTabs, previous);
      orderRef.current = next;
      return next;
    });
  }, [customTabs]);

  const allTabs = useMemo(() => [...FIXED, ...order], [order]);

  const tabXs = useSharedValue<number[]>([]);
  const tabWs = useSharedValue<number[]>([]);
  const pageWidth = useSharedValue(screenWidth);

  useEffect(() => {
    pageWidth.value = screenWidth;
  }, [pageWidth, screenWidth]);

  const reportTabLayout = useCallback((label: string, patch: Partial<TabLayout>) => {
    const previous = layouts.current[label] ?? { x: 0, width: 0 };
    const next: TabLayout = {
      x: patch.x ?? previous.x,
      width: patch.width ?? previous.width,
    };
    layouts.current[label] = next;
    setTabLayouts((state) => {
      const current = state[label];
      if (current?.x === next.x && current?.width === next.width) return state;
      return { ...state, [label]: next };
    });
  }, []);

  const tabsMeasured =
    allTabs.length > 0 &&
    allTabs.every((label) => {
      const layout = tabLayouts[label];
      return layout && layout.width > 0;
    });

  useEffect(() => {
    if (!tabsMeasured) return;
    tabXs.value = allTabs.map((label) => tabLayouts[label]?.x ?? 0);
    tabWs.value = allTabs.map((label) => tabLayouts[label]?.width ?? 0);
  }, [allTabs, tabLayouts, tabWs, tabXs, tabsMeasured]);

  const underlineStyle = useAnimatedStyle(() => {
    const xs = tabXs.value;
    const ws = tabWs.value;
    const count = xs.length;
    if (count === 0) {
      return { opacity: 0, width: 0, transform: [{ translateX: 0 }] };
    }

    const inputRange = xs.map((_, index) => index * pageWidth.value);
    const translateX = interpolate(scrollX.value, inputRange, xs, Extrapolation.CLAMP);
    const width = interpolate(scrollX.value, inputRange, ws, Extrapolation.CLAMP);

    return {
      opacity: 1,
      width,
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.row}>
          {FIXED.map((t) => (
            <Reanimated.View
              key={t}
              layout={layoutTransition}
              style={styles.tabItem}
              onLayout={(ev) => {
                reportTabLayout(t, { x: ev.nativeEvent.layout.x });
              }}
            >
              <TabLabel
                label={t}
                active={active === t}
                onPress={() => onSelect(t)}
                onLabelLayout={(width) => reportTabLayout(t, { width })}
              />
            </Reanimated.View>
          ))}
          {order.map((t) => (
            <DraggableTab
              key={t}
              label={t}
              active={active === t}
              onSelect={onSelect}
              onTabSettings={onTabSettings}
              layouts={layouts}
              order={orderRef}
              setOrder={setOrder}
              onReorder={onReorder}
              onTabLayout={reportTabLayout}
            />
          ))}
          <Pressable
            onPress={onAdd}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingBottom: 10,
              opacity: pressed ? 0.7 : isPro ? 1 : 0.55,
            })}
          >
            <Text style={[styles.add, !isPro && styles.addMuted]}>Add</Text>
            <Plus
              color={isPro ? colors.primary : colors.foregroundMuted}
              size={14}
              strokeWidth={2.4}
            />
          </Pressable>
        </View>
      </ScrollView>

      {tabsMeasured ? (
        <Reanimated.View pointerEvents="none" style={[styles.underline, underlineStyle]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  scrollContent: {
    paddingRight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tabItem: {
    marginRight: TAB_GAP,
    paddingBottom: 10,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.foregroundMuted,
    letterSpacing: -0.1,
  },
  labelActive: {
    fontFamily: 'Inter_500Medium',
    color: colors.foreground,
  },
  underline: {
    position: 'absolute',
    left: 0,
    bottom: -1,
    height: 2,
    backgroundColor: colors.primary,
  },
  add: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.primary,
    letterSpacing: -0.1,
  },
  addMuted: {
    color: colors.foregroundMuted,
  },
});
