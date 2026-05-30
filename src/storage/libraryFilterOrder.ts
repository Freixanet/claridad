import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'claridad:library-filter-order';

export async function getLibraryFilterOrder(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveLibraryFilterOrder(order: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function mergeFilterOrder<T extends string>(availableKeys: T[], savedOrder: string[]): T[] {
  const available = new Set(availableKeys);
  const merged: T[] = [];

  for (const key of savedOrder) {
    if (available.has(key as T) && !merged.includes(key as T)) {
      merged.push(key as T);
    }
  }

  for (const key of availableKeys) {
    if (!merged.includes(key)) {
      merged.push(key);
    }
  }

  return merged;
}
