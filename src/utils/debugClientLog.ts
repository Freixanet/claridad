import { getApiBaseUrl } from '@/utils/apiBaseUrl';

export async function debugClientLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
  runId = 'pre-fix'
): Promise<void> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    await fetch(`${apiBaseUrl}/api/debug-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'd740a4',
        location,
        message,
        data,
        hypothesisId,
        runId,
        timestamp: Date.now(),
      }),
    });
  } catch {
    // ignore
  }
}
