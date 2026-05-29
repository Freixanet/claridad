import { palette } from '@/design/tokens';
import type { TopicKind } from '@/types';

export function topicColors(kind: TopicKind) {
  switch (kind) {
    case 'work':
      return {
        background: palette.topic.work,
        accent: palette.topic.workAccent,
      };
    case 'shopping':
      return {
        background: palette.topic.shopping,
        accent: palette.topic.shoppingAccent,
      };
    case 'ideas':
      return {
        background: palette.topic.ideas,
        accent: palette.topic.ideasAccent,
      };
    case 'project':
      return {
        background: palette.topic.project,
        accent: palette.topic.projectAccent,
      };
    default:
      return {
        background: palette.background.paper,
        accent: palette.accent.primary,
      };
  }
}
