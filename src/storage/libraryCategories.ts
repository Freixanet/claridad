import AsyncStorage from '@react-native-async-storage/async-storage';

export type CustomLibraryCategory = {
  id: string;
  label: string;
  categoryKeys: string[];
};

const STORAGE_KEY = 'claridad:library-categories';

type LibraryCategoriesListener = () => void;
const libraryCategoriesListeners = new Set<LibraryCategoriesListener>();

export function subscribeLibraryCategoriesChange(listener: LibraryCategoriesListener): () => void {
  libraryCategoriesListeners.add(listener);
  return () => libraryCategoriesListeners.delete(listener);
}

function notifyLibraryCategoriesChange() {
  libraryCategoriesListeners.forEach((listener) => listener());
}

export async function getLibraryCategories(): Promise<CustomLibraryCategory[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomLibraryCategory =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CustomLibraryCategory).id === 'string' &&
        typeof (item as CustomLibraryCategory).label === 'string' &&
        Array.isArray((item as CustomLibraryCategory).categoryKeys)
    );
  } catch {
    return [];
  }
}

export async function saveLibraryCategories(categories: CustomLibraryCategory[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export async function removeTopicKeyFromLibraryCategories(topicKey: string): Promise<void> {
  const current = await getLibraryCategories();
  const next = current.map((category) => ({
    ...category,
    categoryKeys: category.categoryKeys.filter((key) => key !== topicKey),
  }));
  await saveLibraryCategories(next);
  notifyLibraryCategoriesChange();
}

export async function addLibraryCategory(category: CustomLibraryCategory): Promise<void> {
  const current = await getLibraryCategories();
  await saveLibraryCategories([...current, category]);
}

export async function updateLibraryCategory(
  id: string,
  patch: Partial<Pick<CustomLibraryCategory, 'label' | 'categoryKeys'>>
): Promise<CustomLibraryCategory | null> {
  const current = await getLibraryCategories();
  const index = current.findIndex((category) => category.id === id);
  if (index === -1) return null;

  const updated: CustomLibraryCategory = {
    ...current[index],
    ...patch,
    label: patch.label?.trim() ?? current[index].label,
    categoryKeys: patch.categoryKeys ?? current[index].categoryKeys,
  };
  const next = [...current];
  next[index] = updated;
  await saveLibraryCategories(next);
  return updated;
}

export async function deleteLibraryCategory(id: string): Promise<boolean> {
  const current = await getLibraryCategories();
  const next = current.filter((category) => category.id !== id);
  if (next.length === current.length) return false;
  await saveLibraryCategories(next);
  return true;
}

export function customFilterKey(id: string): `custom:${string}` {
  return `custom:${id}`;
}

export function isCustomFilterKey(key: string): boolean {
  return key.startsWith('custom:');
}
