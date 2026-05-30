import { Platform } from 'react-native';

/** Prevents iOS Safari / mobile web text selection on long press. */
export const webNoSelectStyle =
  Platform.OS === 'web'
    ? ({
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      } as const)
    : {};

export function clearWebTextSelection(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.getSelection()?.removeAllRanges();
}
