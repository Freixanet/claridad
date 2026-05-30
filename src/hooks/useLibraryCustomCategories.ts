import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  addLibraryCategory,
  deleteLibraryCategory,
  getLibraryCategories,
  subscribeLibraryCategoriesChange,
  updateLibraryCategory,
  type CustomLibraryCategory,
} from '@/storage/libraryCategories';

export function useLibraryCustomCategories() {
  const [categories, setCategories] = useState<CustomLibraryCategory[]>([]);

  const reloadCategories = useCallback(() => {
    void getLibraryCategories().then(setCategories);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadCategories();
    }, [reloadCategories])
  );

  useEffect(() => subscribeLibraryCategoriesChange(reloadCategories), [reloadCategories]);

  const createCategory = useCallback(async (category: CustomLibraryCategory) => {
    await addLibraryCategory(category);
    setCategories((current) => [...current, category]);
    return category;
  }, []);

  const updateCategory = useCallback(
    async (id: string, patch: Partial<Pick<CustomLibraryCategory, 'label' | 'categoryKeys'>>) => {
      const updated = await updateLibraryCategory(id, patch);
      if (!updated) return null;
      setCategories((current) => current.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    []
  );

  const removeCategory = useCallback(async (id: string) => {
    const ok = await deleteLibraryCategory(id);
    if (!ok) return false;
    setCategories((current) => current.filter((item) => item.id !== id));
    return true;
  }, []);

  return { categories, createCategory, updateCategory, removeCategory };
}
