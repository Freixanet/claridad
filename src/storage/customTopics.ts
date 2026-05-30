import AsyncStorage from '@react-native-async-storage/async-storage';

export type CustomTopic = {
  key: string;
  label: string;
  dot: string;
};

const STORAGE_KEY = 'claridad:custom-topics';

export async function getCustomTopics(): Promise<CustomTopic[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomTopic =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CustomTopic).key === 'string' &&
        typeof (item as CustomTopic).label === 'string' &&
        typeof (item as CustomTopic).dot === 'string'
    );
  } catch {
    return [];
  }
}

export async function saveCustomTopics(topics: CustomTopic[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
}

export async function addCustomTopic(topic: CustomTopic): Promise<void> {
  const current = await getCustomTopics();
  if (current.some((entry) => entry.key === topic.key)) {
    throw new Error('Topic key already exists');
  }
  await saveCustomTopics([...current, topic]);
}

export async function deleteCustomTopic(key: string): Promise<boolean> {
  const current = await getCustomTopics();
  const next = current.filter((topic) => topic.key !== key);
  if (next.length === current.length) return false;
  await saveCustomTopics(next);
  return true;
}
