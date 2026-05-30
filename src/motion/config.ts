import { withSpring } from 'react-native-reanimated';

/** Spring config for withSpring / layout transitions. */
export const CLARIDAD_SPRING = {
  stiffness: 300,
  damping: 30,
} as const;

/** Stagger base delay between note items (ms). */
export const STAGGER_MS = 50;

export function claridadWithSpring(toValue: number) {
  return withSpring(toValue, CLARIDAD_SPRING);
}
