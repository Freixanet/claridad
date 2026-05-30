import { Platform, Share } from 'react-native';

import { copyTextToClipboard } from '@/utils/copyToClipboard';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareContent(options: {
  title?: string;
  message: string;
}): Promise<ShareResult> {
  const { title, message } = options;
  if (!message.trim()) return 'failed';

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: title ?? 'Claridad',
          text: message,
        });
        return 'shared';
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
      }
    }

    const copied = await copyTextToClipboard(message);
    return copied ? 'copied' : 'failed';
  }

  try {
    const payload =
      Platform.OS === 'ios'
        ? { message, title: title ?? 'Claridad' }
        : { message: title ? `${title}\n\n${message}` : message };

    const result = await Share.share(payload, {
      dialogTitle: title ?? 'Share document',
      subject: title,
    });

    if (result.action === Share.dismissedAction) return 'cancelled';
    return 'shared';
  } catch {
    return 'failed';
  }
}
