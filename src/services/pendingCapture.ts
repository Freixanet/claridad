/**
 * Holds the local image URI between capture and processing screens.
 * Avoids putting long file:// URLs in route params (which can break navigation
 * persistence and exceed storage limits when state is saved).
 */
let pendingCaptureUri: string | null = null;

export function setPendingCaptureUri(uri: string): void {
  pendingCaptureUri = uri;
}

export function peekPendingCaptureUri(): string | null {
  return pendingCaptureUri;
}

export function consumePendingCaptureUri(): string | null {
  const uri = pendingCaptureUri;
  pendingCaptureUri = null;
  return uri;
}

export function clearPendingCaptureUri(): void {
  pendingCaptureUri = null;
}
