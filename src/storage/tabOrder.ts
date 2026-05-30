import AsyncStorage from '@react-native-async-storage/async-storage';

const TAB_ORDER_KEY = 'claridad:tabOrder';

export async function getTabOrder(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(TAB_ORDER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveTabOrder(order: string[]): Promise<void> {
  await AsyncStorage.setItem(TAB_ORDER_KEY, JSON.stringify(order));
}

export function mergeTabOrder<T extends { id: string }>(available: T[], savedIds: string[]): T[] {
  const byId = new Map(available.map((item) => [item.id, item]));
  const merged: T[] = [];

  for (const id of savedIds) {
    const item = byId.get(id);
    if (item) {
      merged.push(item);
      byId.delete(id);
    }
  }

  for (const item of available) {
    if (byId.has(item.id)) {
      merged.push(item);
    }
  }

  return merged;
}
