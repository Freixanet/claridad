import {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';

import { CLARIDAD_SPRING, STAGGER_MS } from '@/motion/config';

export function useClaridadMotion() {
  const itemLayoutTransition = LinearTransition.springify()
    .damping(CLARIDAD_SPRING.damping)
    .stiffness(CLARIDAD_SPRING.stiffness)
    .reduceMotion(ReduceMotion.System);

  const sectionEntering = (index: number) =>
    FadeInDown.duration(280)
      .delay(index * STAGGER_MS)
      .reduceMotion(ReduceMotion.System);

  const listItemEntering = FadeIn.duration(200).reduceMotion(ReduceMotion.System);

  const listItemExiting = FadeOut.duration(160).reduceMotion(ReduceMotion.System);

  return {
    itemLayoutTransition,
    sectionEntering,
    listItemEntering,
    listItemExiting,
    ReduceMotion,
  };
}
