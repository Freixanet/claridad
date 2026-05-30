import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useClaridadMotion } from '@/motion/useClaridadMotion';

type Props<T> = {
  items: T[];
  keyExtractor: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
  animateEntrance?: boolean;
};

export default function LibraryDocMotionList<T>({
  items,
  keyExtractor,
  renderItem,
  animateEntrance = false,
}: Props<T>) {
  const { itemLayoutTransition, listItemEntering, listItemExiting } = useClaridadMotion();

  return (
    <View style={{ marginTop: 16, gap: 10 }}>
      {items.map((item) => (
        <Animated.View
          key={keyExtractor(item)}
          layout={itemLayoutTransition}
          entering={animateEntrance ? listItemEntering : undefined}
          exiting={listItemExiting}
        >
          {renderItem(item)}
        </Animated.View>
      ))}
    </View>
  );
}
