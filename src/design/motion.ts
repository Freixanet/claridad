import { Easing } from 'react-native-reanimated';

/** Motion reinforces chaos → clarity. No exaggerated bounces. */
export const motionDuration = {
  instant: 120,
  fast: 200,
  normal: 320,
  slow: 480,
  processingStep: 600,
} as const;

export const motionEasing = {
  standard: Easing.bezier(0.25, 0.1, 0.25, 1),
  enter: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.cubic),
  calm: Easing.bezier(0.33, 0, 0.2, 1),
} as const;

export const motionStagger = {
  card: 60,
  fragment: 80,
  step: 120,
} as const;

export const motionScale = {
  press: 0.98,
  subtle: 0.995,
} as const;

export const motion = {
  duration: motionDuration,
  easing: motionEasing,
  stagger: motionStagger,
  scale: motionScale,
} as const;
