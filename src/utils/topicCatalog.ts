import { categoryMeta } from '@/constants/theme';
import type { CustomTopic } from '@/storage/customTopics';

export type TopicMeta = { label: string; dot: string };

const CUSTOM_TOPIC_DOTS = ['#7C3AED', '#DB2777', '#059669', '#D97706', '#2563EB', '#0891B2'];

export function buildTopicCatalog(customTopics: CustomTopic[]): Record<string, TopicMeta> {
  const catalog: Record<string, TopicMeta> = { ...categoryMeta };
  for (const topic of customTopics) {
    catalog[topic.key] = { label: topic.label, dot: topic.dot };
  }
  return catalog;
}

export function getTopicMeta(key: string, catalog: Record<string, TopicMeta>): TopicMeta {
  const known = catalog[key];
  if (known) return known;
  return {
    label: formatTopicLabel(key),
    dot: categoryMeta.other.dot,
  };
}

export function formatTopicLabel(key: string): string {
  return key
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function slugifyTopicLabel(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return slug || `topic-${Date.now().toString(36)}`;
}

export function pickTopicDot(existingCount: number): string {
  return CUSTOM_TOPIC_DOTS[existingCount % CUSTOM_TOPIC_DOTS.length];
}

export function isBuiltInTopic(key: string): boolean {
  return key in categoryMeta;
}

export function uniqueTopicKey(label: string, reservedKeys: Set<string>): string {
  let key = slugifyTopicLabel(label);
  if (!reservedKeys.has(key)) return key;
  let suffix = 2;
  while (reservedKeys.has(`${key}-${suffix}`)) suffix += 1;
  return `${key}-${suffix}`;
}
