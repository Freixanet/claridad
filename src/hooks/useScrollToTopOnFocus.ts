import { useCallback, useRef } from 'react';
import type { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useScrollToTopOnFocus() {
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  return scrollRef;
}

export function useScrollViewsToTopOnFocus<Key extends string>() {
  const scrollRefs = useRef<Partial<Record<Key, ScrollView | null>>>({});

  useFocusEffect(
    useCallback(() => {
      for (const key of Object.keys(scrollRefs.current) as Key[]) {
        scrollRefs.current[key]?.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );

  return useCallback((key: Key) => {
    return (node: ScrollView | null) => {
      scrollRefs.current[key] = node;
    };
  }, []);
}
