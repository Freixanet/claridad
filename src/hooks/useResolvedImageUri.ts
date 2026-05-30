import { useEffect, useState } from 'react';

import { isWebImageRef, resolveImageUri } from '@/services/documentPersistence';

function initialResolved(uri: string | undefined): string {
  const trimmed = uri?.trim() ?? '';
  if (!trimmed || isWebImageRef(trimmed)) return '';
  return trimmed;
}

export function useResolvedImageUri(uri: string | undefined): string {
  const [resolved, setResolved] = useState(() => initialResolved(uri));

  useEffect(() => {
    let cancelled = false;

    void resolveImageUri(uri).then((next) => {
      if (!cancelled) setResolved(next.trim());
    });

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return resolved;
}
