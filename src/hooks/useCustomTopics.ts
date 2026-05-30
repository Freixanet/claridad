import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { addCustomTopic, deleteCustomTopic, getCustomTopics, type CustomTopic } from '@/storage/customTopics';
import { removeTopicKeyFromLibraryCategories } from '@/storage/libraryCategories';
import { buildTopicCatalog, getTopicMeta, isBuiltInTopic, pickTopicDot, uniqueTopicKey } from '@/utils/topicCatalog';
import { categoryMeta } from '@/constants/theme';

type CustomTopicsListener = () => void;
const customTopicsListeners = new Set<CustomTopicsListener>();

function notifyCustomTopicsChange() {
  customTopicsListeners.forEach((listener) => listener());
}

function subscribeCustomTopicsChange(listener: CustomTopicsListener): () => void {
  customTopicsListeners.add(listener);
  return () => customTopicsListeners.delete(listener);
}

export function useCustomTopics() {
  const [customTopics, setCustomTopics] = useState<CustomTopic[]>([]);

  const reloadTopics = useCallback(() => {
    void getCustomTopics().then(setCustomTopics);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadTopics();
    }, [reloadTopics])
  );

  useEffect(() => subscribeCustomTopicsChange(reloadTopics), [reloadTopics]);

  const createTopic = useCallback(async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) throw new Error('Topic label is required');

    const reserved = new Set([
      ...Object.keys(categoryMeta),
      ...customTopics.map((topic) => topic.key),
    ]);
    const key = uniqueTopicKey(trimmed, reserved);
    const topic: CustomTopic = {
      key,
      label: trimmed,
      dot: pickTopicDot(customTopics.length),
    };

    await addCustomTopic(topic);
    setCustomTopics((current) => [...current, topic]);
    notifyCustomTopicsChange();
    return topic;
  }, [customTopics]);

  const removeTopic = useCallback(async (key: string) => {
    if (isBuiltInTopic(key)) return false;
    const ok = await deleteCustomTopic(key);
    if (!ok) return false;
    await removeTopicKeyFromLibraryCategories(key);
    setCustomTopics((current) => current.filter((topic) => topic.key !== key));
    notifyCustomTopicsChange();
    return true;
  }, []);

  const catalog = buildTopicCatalog(customTopics);

  return { customTopics, catalog, createTopic, removeTopic };
}

export function useTopicMeta(category: string) {
  const { catalog } = useCustomTopics();
  return getTopicMeta(category, catalog);
}
