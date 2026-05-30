import { useCallback, useRef } from 'react';
import { Platform, type GestureResponderEvent } from 'react-native';

import { clearWebTextSelection } from '@/utils/webNoSelect';

type Options = {
  delay?: number;
  moveThreshold?: number;
};

const BODY_NO_SELECT_CLASS = 'claridad-no-select';

export function setWebSelectionBlocked(blocked: boolean): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.body.classList.toggle(BODY_NO_SELECT_CLASS, blocked);
  if (!blocked) {
    clearWebTextSelection();
  }
}

export function useWebLongPress(onLongPress: () => void, options: Options = {}) {
  const { delay = 300, moveThreshold = 14 } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const selectBlockerRef = useRef<((event: Event) => void) | null>(null);
  const activatedRef = useRef(false);

  const removeSelectListener = useCallback(() => {
    if (selectBlockerRef.current && typeof document !== 'undefined') {
      document.removeEventListener('selectstart', selectBlockerRef.current, true);
      selectBlockerRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopBlockingSelection = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove(BODY_NO_SELECT_CLASS);
    }
    removeSelectListener();
  }, [removeSelectListener]);

  const startBlockingSelection = useCallback(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    removeSelectListener();
    document.body.classList.add(BODY_NO_SELECT_CLASS);
    const blocker = (event: Event) => {
      event.preventDefault();
    };
    selectBlockerRef.current = blocker;
    document.addEventListener('selectstart', blocker, true);
  }, [removeSelectListener]);

  const resetGesture = useCallback(() => {
    clearTimer();
    originRef.current = null;
    if (!activatedRef.current) {
      stopBlockingSelection();
    } else {
      removeSelectListener();
    }
  }, [clearTimer, removeSelectListener, stopBlockingSelection]);

  const triggerLongPress = useCallback(() => {
    clearTimer();
    activatedRef.current = true;
    setWebSelectionBlocked(true);
    clearWebTextSelection();
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onLongPress();
    requestAnimationFrame(() => clearWebTextSelection());
  }, [clearTimer, onLongPress]);

  if (Platform.OS !== 'web') {
    return {};
  }

  return {
    onTouchStart: (event: GestureResponderEvent) => {
      activatedRef.current = false;
      const touch = event.nativeEvent.touches[0];
      if (!touch) return;
      originRef.current = { x: touch.pageX, y: touch.pageY };
      startBlockingSelection();
      clearTimer();
      timerRef.current = setTimeout(triggerLongPress, delay);
    },
    onTouchMove: (event: GestureResponderEvent) => {
      const touch = event.nativeEvent.touches[0];
      const origin = originRef.current;
      if (!touch || !origin || activatedRef.current) return;
      const distance = Math.hypot(touch.pageX - origin.x, touch.pageY - origin.y);
      if (distance > moveThreshold) {
        resetGesture();
      }
    },
    onTouchEnd: resetGesture,
    onTouchCancel: () => {
      activatedRef.current = false;
      clearTimer();
      originRef.current = null;
      stopBlockingSelection();
    },
  };
}

export const libraryDocCardClassName = 'library-doc-card';
