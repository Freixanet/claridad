import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  getLibraryFilterOrder,
  mergeFilterOrder,
  saveLibraryFilterOrder,
} from '@/storage/libraryFilterOrder';

export function useLibraryFilterOrder<T extends string>(defaultKeys: T[]) {
  const [savedOrder, setSavedOrder] = useState<string[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getLibraryFilterOrder().then(setSavedOrder);
    }, [])
  );

  useEffect(() => {
    if (savedOrder === null) return;
    const merged = mergeFilterOrder(defaultKeys, savedOrder);
    if (merged.join('|') !== savedOrder.join('|')) {
      void saveLibraryFilterOrder(merged);
      setSavedOrder(merged);
    }
  }, [defaultKeys, savedOrder]);

  const orderedKeys = useMemo(() => {
    if (savedOrder === null) return defaultKeys;
    return mergeFilterOrder(defaultKeys, savedOrder);
  }, [defaultKeys, savedOrder]);

  const reorderKeys = useCallback(async (nextOrder: T[]) => {
    setSavedOrder(nextOrder);
    await saveLibraryFilterOrder(nextOrder);
  }, []);

  return { orderedKeys, reorderKeys, orderReady: savedOrder !== null };
}
